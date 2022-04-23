import {
    SlashCommandBuilder
} from "@discordjs/builders";
import CommonOptions from "./data/commonOptions.js";

class TeamCommand {
    constructor(application) {
        this.userManager = application.userManager;
    }

    asBuilder() {
        return new SlashCommandBuilder()
            .setName("team")
            .setDescription("Allows to manage team members")
            .addSubcommand((command) => command
                .setName("list")
                .setDescription("Lists all team members in their section of the Advaced team")
            )
            .addSubcommand((command) => command
                .setName("add-user")
                .setDescription("Adds a discord user to the team")
                .addUserOption(CommonOptions.userOption)
                .addStringOption(CommonOptions.positionOption)
                .addNumberOption(CommonOptions.permissionLevelOption)
            )
            .addSubcommand((command) => command
                .setName("remove-user")
                .setDescription("Removes a discord user from the team")
                .addUserOption(CommonOptions.userOption)
            )
            .addSubcommand((command) => command
                .setName("set-user-permission-level")
                .setDescription("Sets the permission level of a discord user on the discord server")
                .addUserOption(CommonOptions.userOption)
                .addNumberOption(CommonOptions.permissionLevelOption.setRequired(true))
            )
            .addSubcommand((command) => command
                .setName("set-user-position")
                .setDescription("Sets the permission level of a discord user")
                .addUserOption(CommonOptions.userOption)
                .addStringOption(CommonOptions.positionOption)
            );
    }

    async execute(interaction) {
        // Fetch the subcommand
        const subcommand = interaction.options.getSubcommand();
        const data = {};

        // Check which subcommand was called and fetch the provided data
        switch (subcommand) {
            case "list":
                data.action = "list";
                break;

            case "add-user":
                data.action = "add";
                data.userId = interaction.options.get("user").value;
                data.position = interaction.options.get("position").value;
                data.permissionLevel = interaction.options.get("permission-level")?.value ?? 0;
                break;

            case "remove-user":
                data.action = "remove";
                data.userId = interaction.options.get("user").value;
                break;

            case "set-user-permission-level":
                data.action = "setPermissionLevel";
                data.userId = interaction.options.get("user").value;
                data.permissionLevel = interaction.options.get("permission-level").value;
                break;

            case "set-user-position":
                data.action = "setPosition";
                data.userId = interaction.options.get("user").value;
                data.position = interaction.options.get("position").value;
                break;
        }

        await this.userManager.adjustTeamMember(interaction, data);
    }
}

export default TeamCommand;
