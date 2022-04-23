import {SlashCommandBuilder} from "@discordjs/builders";
import {MessageEmbed} from "discord.js";

import CommonOptions from "./data/commonOptions.js";

class VerifyWalletCommand {
    constructor(application) {
        this.application = application;
    }

    asBuilder() {
        return new SlashCommandBuilder()
            .setName('verify-wallet')
            .setDescription('Verifies your wallet with help of your public key and signature')
            .addStringOption(CommonOptions.publicKeyOption)
            .addStringOption(CommonOptions.signatureOption);
    }

    async execute(interaction) {
        await interaction.deferReply({ephemeral: true})

        // Create response embed
        const embed = new MessageEmbed()
            .setTitle("Verify your wallet")
            .setDescription('The function of this command is coming soon :)')
            .setURL('https://advaced.org');

        await interaction.editReply({ embeds: [embed] });
    }
}

export default VerifyWalletCommand;
