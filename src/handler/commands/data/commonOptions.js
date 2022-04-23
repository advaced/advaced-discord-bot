import {SlashCommandNumberOption, SlashCommandStringOption, SlashCommandUserOption} from "@discordjs/builders";

class CommonOptions {
    static get userOption() {
        return new SlashCommandUserOption()
            .setName('user')
            .setDescription('The user to get the info of')
            .setRequired(true);
    }

    static get positionOption() {
        return new SlashCommandStringOption()
            .setName('position')
            .setDescription('The position of the user in the list')
            .setRequired(true);
    }

    static get permissionLevelOption() {
        return new SlashCommandNumberOption()
            .setName('permission-level')
            .setDescription('The permission level of the user (0: member (default), 1: moderator, 2: administrator)')
            .setRequired(false);
    }

    static get publicKeyOption() {
        return new SlashCommandStringOption()
            .setName('public-key')
            .setDescription('The public key of the wallet, which is used to verify the user')
            .setRequired(true);
    }

    static get signatureOption() {
        return new SlashCommandStringOption()
            .setName('signature')
            .setDescription('The signature of the wallet, which is used to verify the user')
            .setRequired(true);
    }

    static get messagesOption() {
        return new SlashCommandNumberOption()
            .setName('messages')
            .setDescription('The amount of messages to delete (if not specified, 100 messages will be deleted')
            .setRequired(false);
    }
}

export default CommonOptions;
