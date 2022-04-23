import {Client, Intents} from 'discord.js';
import winston from 'winston';

import CallbackManager from "./handler/callbackManager.js";
import UserManager from "./handler/userManager.js";
import CommandRegistrar from "./handler/commandRegistrar.js";

import loadConfig from './util/configLoader.js';
import DatabaseInterface from "./util/databaseInterface.js";
import sleep from "./util/sleep.js";

// Configurate logger
winston.configure({
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        verbose: 3,
        debug: 4,
        silly: 5
    },
    exitOnError: false,
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp(),
                winston.format.printf(info => `${info.timestamp} -> ${info.message}`)
            )
        })
    ],
    level: 'info'
});

winston.info(`Logging with level ${winston.level}`);

// Set up the bot
const bot = new Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING
    ],
});

(async () => {
    // Fetch the config
    winston.verbose('Loading configuration...');
    const config = await loadConfig;

    winston.info("Configuration has been loaded!");

    // Set the database up
    winston.verbose('Setting up database...');
    const database = new DatabaseInterface(config);
    winston.info('Database has been set up!');

    // Set the command registry up
    winston.verbose('Setting up other managers...');
    const callbackManager = new CallbackManager();
    const application = {config, bot, database, callbackManager, userManager: null, commandRegistrar: null};

    // Load the user handler
    const userManager = new UserManager(application);
    application.userManager = userManager;

    // Load the command registrar
    const commandRegistrar = new CommandRegistrar(application);
    application.commandRegistrar = commandRegistrar;

    const commandScanningPromise = commandRegistrar.scan();

    bot.on('ready', () => {
        winston.info(`Logged in as ${bot.user.tag}!`);

        bot.user.setActivity('VAC: ? | Coming Soon', {type: 'WATCHING'});
    });

    bot.on('guildMemberAdd', member => {
        userManager.handleNewUser(member);
    });

    bot.on("messageCreate", (message) => {
        if (!message.author.bot) {
            if (message.guild !== null) {
                const botManagers = config['bot-managers'];

                winston.debug(`Fetched bot managers: ${botManagers}`);
                winston.debug(`Fetched message author: ${message.author.id}`);

                if (botManagers != null && botManagers.includes(message.author.id)) {
                    switch (message.content) {
                        case `${bot.user.username} reload-guild-commands`:
                            commandScanningPromise
                                .then(() => commandRegistrar.registerCommandsForGuild(message.guild))
                                .then(() => message.reply("Guild slash commands reloaded!"));
                            winston.info('Guild slash commands reloaded!');
                            break;

                        case `${bot.user.username} reload-global-commands`:
                            commandScanningPromise
                                .then(() => commandRegistrar.registerGlobalCommands())
                                .then(() => message.reply("Global slash commands reloaded!"));
                            winston.info('Global slash commands reloaded!');
                            break;
                    }
                }
            }
        }
    });

    bot.on("interactionCreate", (interaction) => {
        if(interaction.isCommand()) {
            commandRegistrar.handleInteraction(interaction);
        }
    });

    await bot.login(config.token)

    // Update user roles
    while (true) {
        winston.verbose('Updating user roles...');
        await userManager.updateUserRoles();
        winston.verbose('User roles have been updated!');

        await sleep(60);
    }
})();
