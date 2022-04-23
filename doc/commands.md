## Commands
Here you can find the commands that are available in the current version of the Advaced Discord bot.

### Permission levels
The bot supports 3 permission levels:
- `2` = `administrator`: The user is allowed to use all commands.
- `1` = `moderator`: The user is allowed to use all commands except the team management commands.
- `0` = `member`: The user is allowed to use all commands except the team management commands and server management 
  commands.

-----

### User commands
Everyone can use the following commands.

#### Connect to wallet
Command: `/connect-wallet`

Description: Sends a link to a page on https://advaced.org to verify that the user has access to the wallet.

#### Verify wallet
Command: `/verify-wallet <wallet_address> <signature>`

Description: Verifies that the user has access to the wallet with the given signature (signed a verification text).

Options:
- `wallet_address`: The public key of the wallet.
- `signature`: The signature that was made with the wallets private key.

#### Disconnect to wallet
Command: `/disconnect-wallet`

Description: Disconnects the user from the set wallet.

#### List team members
Command: `/team list`

Description: Lists all team members and their position in the Advaced organization.

### Moderator commands
Only users with the `moderator` rank can use the following commands.

#### Clear messages
Command: `/clear [message_count]`

Description: Clears the chat. If no message count is given, 100 messages are deleted, which is the limit.

Options:
- `message_count`: The number of messages to delete.

### Administrator commands
Only users with the `administrator` rank can use the following commands.

#### Add team member
Command: `/team add-user <user> [position]`

Description: Adds the user with the given user mention to the team on the given position.

Options:
- `user`: The user mention of the user to add.
- `position`: The position of the user in the team.

#### Remove team member
Command: `/team remove-user <user>`

Description: Removes the user with the given user mention from the team.

Options:
- `user`: The user mention of the user to remove.

#### Set team member position
Command: `/team set-user-position <user> <position>`

Description: Updates the position of the user with the given user mention to the given position.

Options:
- `user`: The user mention of the user to update.
- `position`: The new position of the user in the team.

#### Set user permission level
Command: `/team set-user-permission-level <user> <permission_level>`

Description: Updates the permission level of the user with the given user mention to the given permission level.

Options:
- `user`: The user mention of the user to update.
- `permission_level`: The new permission level of the user.

#### Unverify user
Command: `/remove-user-verification <user>`

Description: Unverifies the user with the given user mention.

Options:
- `user`: The user mention of the user to unverify.
