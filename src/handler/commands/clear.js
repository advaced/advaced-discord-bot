import {SlashCommandBuilder} from "@discordjs/builders";
import {MessageEmbed} from "discord.js";

import CommonOptions from "./data/commonOptions.js";

class ClearCommand {
    constructor(application) {
        this.application = application;
    }

    asBuilder() {
        return new SlashCommandBuilder()
            .setName("clear")
            .setDescription("Clear the chat history")
            .addNumberOption(CommonOptions.messagesOption);
    }

    async execute(interaction) {
        await interaction.deferReply({ephemeral: true});

        // Check if the command was executed in a guild
        if (!interaction.member) {
            return interaction.reply('This is not a guild!');
        }

        // Fetch member of the guild
        const member = await interaction.guild.members.fetch(interaction.user.id);

        // Check if the user has permission to clear the chat
        if (!member.permissions.has('MANAGE_MESSAGES', true)) {
            return interaction.reply("You don't have permission to clear the chat!");
        }

        // Check if the user has specified a number of messages to clear
        const messages = interaction.options.get("messages");
        let messageCount;

        if (messages) {
            if (messages.value < 1 || messages.value > 100) {
                return interaction.reply('Invalid amount of messages to clear (limit is one hundred). ');
            }

            // Messagecount as response
            messageCount = messages.value

            // Clear the specified number of messages
            await interaction.channel.bulkDelete(messages.value);
        }

        else {
            // Messagecount as response
            messageCount = 100;

            // Clear all messages
            await interaction.channel.bulkDelete(100);
        }

        // Send a confirmation message
        const embed = new MessageEmbed()
            .setTitle("Chat cleared")
            .setDescription(`Cleared ${messageCount} message(s)`)
            .setColor('#8900ff');

        await interaction.editReply({ embeds: [embed] });
    }
}

export default ClearCommand;
