import {SlashCommandBuilder} from "@discordjs/builders";
import {MessageEmbed} from "discord.js";

class DisconnectWalletCommand {
    constructor(application) {
        this.application = application;
    }

    asBuilder() {
        return new SlashCommandBuilder()
            .setName('disconnect-wallet')
            .setDescription('Disconnects the set wallet from your discord account');
    }

    async execute(interaction) {
        await interaction.deferReply({ephemeral: true})

        // Create response embed
        const embed = new MessageEmbed()
            .setTitle("Disconnect your wallet")
            .setDescription('The function of this command is coming soon :)')
            .setURL('https://advaced.org');

        await interaction.editReply({ embeds: [embed] });
    }
}

export default DisconnectWalletCommand;
