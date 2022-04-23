import {REST} from "@discordjs/rest";
import {Routes} from "discord-api-types/v10";
import winston from "winston";
import path from "path";

import * as fs from "../util/promiseFs.js";


class CommandRegistrar {
    constructor(application) {
        this.application = application;

        this.rest = new REST({version: "10"}).setToken(application.config.token);

        this.commandsDir = path.resolve('src', 'handler', 'commands');

        this.guildCommandMapping = new Map();
        this.guildCommandBuilders = [];
        this.globalCommandMapping = new Map();
        this.globalCommandBuilders = [];
    }

    async scan() {
        winston.debug("Scanning all commands...");
        winston.verbose(`commandsDir = ${this.commandsDir}`);

        // Scan all commands
        const files = await fs.readdir(this.commandsDir)
            .then((files) => files.filter((f) => f.endsWith(".js")));

        winston.debug(`Found ${files.length} commands!`);

        // Load all commands
        const commands = await Promise.all(
            files.map(
                (file) => import(path.resolve(this.commandsDir, file)).then((module) => new module.default(
                    this.application
                ))
            )
        );

        winston.verbose("Command modules loaded!");

        commands.forEach((command) => {
            const builder = command.asBuilder();

            if(command.isGlobal != null && command.isGlobal()) {
                this.globalCommandMapping.set(builder.name, command);
                this.globalCommandBuilders.push(builder);
            } else {
                this.guildCommandMapping.set(builder.name, command);
                this.guildCommandBuilders.push(builder);
            }
        });
    }

    async registerGlobalCommands() {
        const clientId = this.application.bot.application.id;

        winston.verbose(`Registering global commands`);
        const commandData = this.globalCommandBuilders.map((builder) => builder.toJSON());

        await this.rest.put(
            Routes.applicationCommands(clientId),
            {
                body: commandData
            }
        );

        winston.verbose(`Registered ${commandData.length} global commands`);
    }

    async registerCommandsForGuild(guild) {
        const clientId = this.application.bot.application.id;
        const guildId = guild.id;

        winston.verbose(`Registering guild commands for guild ${guildId} (including global commands)`);
        const commandData = this.guildCommandBuilders
            .concat(this.globalCommandBuilders)
            .map((builder) => builder.toJSON());

        await this.rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            {
                body: commandData
            }
        );

        winston.verbose(`Registered ${commandData.length} commands for guild ${guildId}`);
        winston.verbose("Setting command permissions...");

        const permissionUpdates = [];

        const commands = await guild.commands.fetch();
        commands.forEach((commandScope) => {
            if (commandScope.applicationId !== this.application.bot.application.id) {
                return;
            }

            const commandName = commandScope.name;
            const command = this.guildCommandMapping.get(commandName);

            if (command == null) {
                if(!this.globalCommandMapping.has(commandName)) {
                    winston.warn(`Guild ${guildId} has a command ${commandName} which is from this bot, but not registered as a Javascript file?!`);
                }
                return;
            }

            if (command.getRequiredPermissions === null || command.getRequiredPermissions === undefined) {
                winston.verbose(`Command ${commandName} has no permission requirements, skipping update!`);
                return;
            }

            const requiredPermissions = command.getRequiredPermissions();
            winston.verbose(`Command ${commandName} requires permissions [${requiredPermissions.join(", ")}]`);
            const allowedRoles = resolveElevatedPermissionRoles(this.application.config, requiredPermissions);
            winston.verbose(`Resolved role id's for ${commandName} are [${allowedRoles.join(", ")}]`);

            const permissions = allowedRoles.map((roleId) => ({
                id: roleId,
                type: "ROLE",
                permission: true
            }));

            permissionUpdates.push({
                id: commandScope.id,
                permissions
            });
        });

        winston.verbose(`Sending ${permissionUpdates.length} permission updates`);
        await guild.commands.permissions.set({
            fullPermissions: permissionUpdates
        });
    }

    async handleInteraction(interaction) {
        const commandName = interaction.commandName;
        const command = interaction.inGuild() ?
            this.guildCommandMapping.get(commandName) ?? this.globalCommandMapping.get(commandName) :
            this.globalCommandMapping.get(commandName);

        if (command == null) {
            winston.warn(`Received interaction for command ${commandName}, which does not belong to this bot!`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (e) {
            winston.error(`Command failed to execute`);

            const errorMessage = `The command failed to execute with an internal error ->>> ${e.toString()}`;

            if(interaction.deferred || interaction.replied) {
                await interaction.editReply({
                    content: errorMessage,
                    components: [],
                    embeds: []
                });
            } else {
                await interaction.reply({
                    content: errorMessage,
                    components: [],
                    embeds: []
                });
            }
        }
    }
}

export default CommandRegistrar;
