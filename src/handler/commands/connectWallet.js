import {SlashCommandBuilder} from "@discordjs/builders";
import {MessageEmbed} from "discord.js";

class ConnectWalletCommand {
    constructor(application) {
        this.application = application;
    }

    asBuilder() {
        return new SlashCommandBuilder()
            .setName("connect-wallet")
            .setDescription("Shows you how were you can connect your wallet with your discord account");
    }

    async execute(interaction) {
        await interaction.deferReply({ephemeral: true})

        // Create response embed
        const embed = new MessageEmbed()
            .setTitle("Connect your wallet")
            .setDescription('You can connect your wallet with your discord account by following the steps on this' +
                ' page: https://advaced.org/discord/connect-wallet `Currently not working`')
            .setURL('https://advaced.org/discord/connect-wallet');

        await interaction.editReply({ embeds: [embed] });
    }
}

export default ConnectWalletCommand;
