import sqlite from 'sqlite3';

import {assertArgHasValue} from "./assert.js";

class DatabaseInterface {
    constructor(config) {
        this.database = new sqlite.Database(config.databasePath);
        this.ensureSetup();
    }

    ensureSetup() {
        this.database.run('CREATE TABLE IF NOT EXISTS team_member (uuid VARCHAR(20) UNIQUE PRIMARY KEY, position' +
            ' VARCHAR(16), permission_level INTEGER, first_attended INTEGER)');
        this.database.run('CREATE TABLE IF NOT EXISTS users (uuid INTEGER UNIQUE PRIMARY KEY, public_key VARCHAR(128))');
    }

    runAsync(sql, params) {
        return new Promise((resolve, reject) => {
            this.database.run(sql, params, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    getAsync(sql, params) {
        return new Promise((resolve, reject) => {
            this.database.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    allAsync(sql, params) {
        return new Promise((resolve, reject) => {
            this.database.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async setTeamMember(uuid, position, permissionLevel) {
        assertArgHasValue(uuid, 'uuid');
        assertArgHasValue(position, 'position');

        // Check if team member already exists in the database
        let existingTeamMember = await this.getTeamMember(uuid);

        if (existingTeamMember) {
            // Update team members
            await this.runAsync('UPDATE team_member SET position = ? AND permission_level = ? WHERE uuid = ?', [position, permissionLevel, uuid]);
        } else {
            // Insert new team member
            await this.runAsync('INSERT INTO team_member (uuid, position, permission_level, first_attended) VALUES' +
                ' (?, ?, ?, ?)',
                [uuid, position, permissionLevel, Date.now()]);
        }
    }

    async getTeamMember(uuid) {
        assertArgHasValue(uuid, 'uuid');

        return this.getAsync('SELECT * FROM team_member WHERE uuid = ?', [uuid]);
    }

    async getTeamMembersByPosition(position) {
        assertArgHasValue(position, 'position');

        return this.allAsync('SELECT * FROM team_member WHERE position = ?', [position]);
    }

    async setTeamMemberPermissionLevel(uuid, permissionLevel) {
        assertArgHasValue(uuid, 'uuid');
        assertArgHasValue(permissionLevel, 'permissionLevel');

        // Check if team member already exists in the database
        let existingTeamMember = await this.getTeamMember(uuid);

        if (!existingTeamMember) {
            return false;
        }

        await this.runAsync('UPDATE team_member SET permission_level = ? WHERE uuid = ?', [permissionLevel, uuid]);
        return true;
    }

    async getTeamMemberPermissionLevel(uuid) {
        assertArgHasValue(uuid, 'uuid');

        return this.getAsync('SELECT permission_level FROM team_member WHERE uuid = ?', [uuid]);
    }

    async getAllTeamMembers() {
        return this.allAsync('SELECT * FROM team_member');
    }

    async removeTeamMember(uuid) {
        assertArgHasValue(uuid, 'uuid');

        // Check if the user is included in the database
        let existingTeamMember = await this.getTeamMember(uuid);

        if (!existingTeamMember) {
            return false;
        }

        await this.runAsync('UPDATE team_member SET position = ? WHERE uuid = ?', ['none', uuid]);

        return true;
    }

    async setUser(uuid) {
        assertArgHasValue(uuid, 'uuid');

        // Check if user already exists
        let existingUser = await this.getUser(uuid);

        if (!existingUser) {
            await this.runAsync('INSERT INTO users (uuid) VALUES (?)', [uuid]);
        }
    }

    async getUser(uuid) {
        assertArgHasValue(uuid, 'uuid');

        return this.getAsync('SELECT * FROM users WHERE uuid = ?', [uuid]);
    }

    async getUserByPublicKey(publicKey) {
        assertArgHasValue(publicKey, 'publicKey');

        return this.getAsync('SELECT * FROM users WHERE public_key = ?', [publicKey]);
    }

    async setUserPublicKey(uuid, publicKey) {
        assertArgHasValue(uuid, 'uuid');
        assertArgHasValue(publicKey, 'publicKey');

        await this.runAsync('UPDATE users SET public_key = ? WHERE uuid = ?', [publicKey, uuid]);
    }
}

export default DatabaseInterface;
