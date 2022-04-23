import {SlashCommandBuilder} from "@discordjs/builders";
import {MessageEmbed} from "discord.js";

import CommonOptions from "./data/commonOptions.js";

class UnverifyUserCommand {
    constructor(application) {
        this.application = application;
    }

    asBuilder() {
        return new SlashCommandBuilder()
            .setName('remove-user-verification')
            .setDescription('Unverifies the mentionend user')
            .addUserOption(CommonOptions.userOption);
    }

    async execute(interaction) {
        await interaction.deferReply({ephemeral: true})

        // Create response embed
        const embed = new MessageEmbed()
            .setTitle("Unverify user")
            .setDescription('The function of this command is coming soon :)')
            .setURL('https://advaced.org');

        await interaction.editReply({ embeds: [embed] });
    }
}

export default UnverifyUserCommand;
