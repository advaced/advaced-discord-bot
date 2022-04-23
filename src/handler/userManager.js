import {MessageEmbed} from "discord.js";

export class UserManager {
    constructor(application) {
        this.config = application.config;
        this.bot = application.bot;
        this.database = application.database;
    }

    async updateUserRoles() {
        // TODO: Update user roles according to their investment and delegation on the Advaced blockchain
    }

    async handleNewUser(user) {
        if (user.bot) return;

        // Send welcome message
        const welcomeMessage = new MessageEmbed()
            .setTitle(":VACrainbow: Welcome to the Advaced Community :VACrainbow:")
            .setDescription(`Welcome to the server, ${user}!\n We hope you enjoy your stay and have fun in our community 🌈\n *If you have any questions about Advaced, feel free to ask them in the help section.*`)
            .setColor('#ff00c3')
            .setThumbnail(user.avatarURL())
            .setTimestamp();

        // Fetch the welcome channel from the config
        const welcomeChannel = this.bot.channels.get(this.config['channels']['welcome']);

        // Send the welcome message to the welcome channel
        await welcomeChannel.send({ embeds: [welcomeMessage] });
    }

    async adjustTeamMember(interaction, data) {
        await interaction.deferReply({ephemeral: true});

        // Check if the user wants to have a list of all members
        if (data.action === 'list') {
            // Get all members
            let members = await this.database.getAllTeamMembers();

            // Create response embed
            let embed = new MessageEmbed();
            embed.setTitle('Team Overview');
            embed.setColor('#0097ff');

            // Add all members
            for (let member of members) {
                if (member.position !== 'none') {
                    const user = await interaction.guild.members.fetch(member.uuid);

                    // Check if the user is in the guild
                    if (!user) continue;

                    embed.addField(`${user.user.username}#${user.user.discriminator}`, `Position: ${member.position}`);
                }
            }

            // Check if there are no team members
            if (embed.fields.length === 0) {
                embed.setDescription('There are no team members yet.');
            }

            // Reply with the embed
            await interaction.editReply({ embeds: [embed] });

            return;
        }

        // Check if the user has the right permissions
        if (await this.database.getTeamMemberPermissionLevel(interaction.user.id) < 2) {
            await interaction.editReply('You do not have the permissions to add a member to the team.');
            return;
        }

        if (data.action === 'add') {
            // Check if the permission level is in range
            if (data.permissionLevel < 0 || data.permissionLevel > 2) {
                await interaction.editReply('The permission level must be between 0 and 2.');
                return;
            }

            // Check if position name is longer than 16 characters
            if (data.position.length > 16) {
                await interaction.editReply('The position name must be shorter than 16 characters.');
                return;
            }

            // Add user to the team
            await this.database.setTeamMember(data.userId, data.position, data.permissionLevel);

            // Create response embed
            let embed = new MessageEmbed();
            embed.setTitle('Added user successfully');

            const user = await this.bot.users.fetch(data.userId);
            embed.setDescription(`Added ${user.username}#${user.discriminator} to the team at position \`${data.position}\``);

            embed.setColor('#00ffd2');

            // Reply with the embed
            await interaction.editReply({ embeds: [embed] });
        }

        else if (data.action === 'remove') {
            // Remove user from the team
            let success = await this.database.removeTeamMember(data.userId);

            if (!success) {
                await interaction.editReply('The user was not found among the team members.');
                return;
            }

            // Create response embed
            let embed = new MessageEmbed();
            embed.setTitle('Removed user successfully');

            const user = await this.bot.users.fetch(data.userId);
            embed.setDescription(`Removed ${user.username}#${user.discriminator} from the team`);

            embed.setColor('#00ffd2');

            // Reply with the embed
            await interaction.editReply({ embeds: [embed] });
        }

        else if (data.action === 'setPosition') {
            // Check if position name is longer than 16 characters
            if (data.position.length > 16) {
                await interaction.editReply('The position name must be shorter than 16 characters.');
                return;
            }

            // Change user position
            await this.database.setTeamMember(data.userId, data.position);

            // Create response embed
            let embed = new MessageEmbed();
            embed.setTitle('Changed position successfully');

            const user = await this.bot.users.fetch(data.userId);
            embed.setDescription(`Changed position of ${user.username}#${user.discriminator} to \`${data.position}\``);

            embed.setColor('#00ffd2');

            // Reply with the embed
            await interaction.editReply({ embeds: [embed] });
        }

        else if (data.action === 'setPermissionLevel') {
            // Check if the permission level is in range
            if (data.permissionLevel < 0 || data.permissionLevel > 2) {
                await interaction.editReply('The permission level must be between 0 and 2.');
                return;
            }

            // Change user permission level
            let success = await this.database.setTeamMemberPermissionLevel(data.userId, data.permissionLevel);

            if (!success) {
                await interaction.editReply('The user was not found among the team members.');
                return;
            }

            // Create response embed
            let embed = new MessageEmbed();
            embed.setTitle('Changed permission level successfully');

            const user = await this.bot.users.fetch(data.userId);
            embed.setDescription(`Changed permission level of ${user.username}#${user.discriminator} to \`${data.permissionLevel}\``);

            embed.setColor('#00ffd2');

            // Reply with the embed
            await interaction.editReply({ embeds: [embed] });
        }

        else {
            await interaction.editReply('Invalid action.');
        }
    }
}

export default UserManager;
