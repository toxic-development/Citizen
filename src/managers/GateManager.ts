import Citizen from '../client/Citizen';
import { DatabaseResponse, FiveMServer, GatedCheckResponse, GrantedServer, GrantedServerPerms } from '../types/db.interface';
import * as Models from '../models/models';

export class GateManager {

    public client: Citizen;
    private models = Models;

    constructor(client: Citizen) {
        this.client = client;
    }

    public async checkGatedAccess({ user, server, action }: GrantedServer): Promise<GatedCheckResponse> {

        if (!user || !server) return {
            success: false,
            error: 'Parameters should include user and server.',
        }

        const db = await this.models.UserModel.findOne({ user: user });
        const s = await db?.servers.find(s => s.id === server);

        if (s?.permissions?.owner) return {
            success: true,
            owner: true
        }

        else if (s?.permissions?.canEdit) return {
            success: true,
            canEdit: true
        }

        else if (s?.permissions?.canDelete) return {
            success: true,
            canDelete: true
        }

        else if (s?.permissions?.canView) return {
            success: true,
            canView: true
        }

        else if (s?.permissions?.canRcon) return {
            success: true,
            canRcon: true
        }

        else return {
            success: false,
            error: 'Lacking permissions.',
        }
    }

    /**
     * Grants a user gated access to a server.
     * @param user The user to grant access to.
     * @param server The server to grant access to.
     * @param perms The permissions to grant.
     * @returns type: DatabaseResponse
     */
    public async addGatedAccess({ user, server, type, perms }: GrantedServer): Promise<DatabaseResponse> {

        if (!user || !server || !type || !perms) return {
            success: false,
            error: 'Missing required parameters.',
            needed: 'user, server, type, perms'
        }

        const gate = await this.checkGatedAccess({ user: user, server: server });

        if (gate.success) return {
            success: true,
            error: 'User appears to already have access to this server, if you\'d like to grant them more permissions please use the `/gate update` command.',
        }

        if (!gate.success) await new this.models.UserModel({
            user: user, servers: [{
                id: server,
                type: type,
                permissions: {
                    owner: false,
                    canRcon: perms.canRcon,
                    canEdit: perms.canEdit,
                    canView: perms.canView,
                    canDelete: perms.canDelete
                }
            }]
        }).save().catch((err: Error) => {
            return {
                success: false,
                error: err.message,
            }
        });

        return {
            success: true,
            error: `Success user has been granted: ${perms} permissions for server: ${server}`,
        }
    }

    public async updateGatedAccess({ user, server, perms }: GrantedServer): Promise<DatabaseResponse> {

        if (!user || !server || !perms) return {
            success: false,
            error: 'Missing required parameters.',
            needed: 'user, server, perms'
        }

        const gate = await this.checkGatedAccess({ user: user, server: server });

        if (!gate.success) return {
            success: false,
            error: 'User does not have access to this server.',
        }

        if (gate.success) await this.models.UserModel.updateOne({ id: user, 'servers.id': server }, {
            $set: {
                'servers.$.permissions': {
                    owner: false,
                    canRcon: perms.canRcon,
                    canEdit: perms.canEdit,
                    canView: perms.canView,
                    canDelete: perms.canDelete
                }
            }
        }).catch((err: Error) => {
            return {
                success: false,
                error: err.message,
            }
        });

        return {
            success: true,
            error: `Success user has been granted: ${perms} permissions for server: ${server}`,
        }
    }

    public async removeGatedAccess({ user, server, perms }: GrantedServer): Promise<DatabaseResponse> {

        if (!user || !server) return {
            success: false,
            error: 'Missing required parameters.',
            needed: 'user, server, perms'
        }

        const gate = await this.checkGatedAccess({ user: user, server: server });

        if (!gate.success) return {
            success: false,
            error: 'User does not have access to this server.',
        }

        if (gate.success) await this.models.UserModel.updateOne({ id: user, 'servers.id': server }, {
            $set: {
                'servers.$.permissions': {
                    owner: false,
                    canRcon: perms?.canRcon,
                    canEdit: perms?.canEdit,
                    canView: perms?.canView,
                    canDelete: perms?.canDelete
                }
            }
        }).catch((err: Error) => {
            return {
                success: false,
                error: err.message,
            }
        });

        return {
            success: true,
            error: `Success user has been removed from server: ${server}`,
        }
    }

    public async revokeAccess({ user, server }: GrantedServer): Promise<DatabaseResponse> {

        if (!user || !server) return {
            success: false,
            error: 'Missing required parameters.',
            needed: 'user, server'
        }

        const gate = await this.checkGatedAccess({ user: user, server: server });

        if (!gate.success) return {
            success: false,
            error: 'User does not have access to this server.',
        }

        if (gate.success) await this.models.UserModel.updateOne({ id: user, 'servers.id': server }, {
            $pull: {
                servers: {
                    id: server
                }
            }
        }).catch((err: Error) => {
            return {
                success: false,
                error: err.message,
            }
        });

        return {
            success: true,
            error: `Success user has been removed from server: ${server}`,
        }
    }

    public async verifyPermsForAction({ user, server, action }: GrantedServer): Promise<DatabaseResponse> {

        if (!user || !server || !action) {
            return {
                success: false,
                error: 'Missing required parameters.',
                needed: 'user, server, action'
            }
        }

        const userr = await this.models.UserModel.findOne({ id: user });

        if (!userr) {
            return {
                success: false,
                error: 'Unable to locate user.',
            }
        }

        const s: any = userr.servers.find(s => s.id === server);

        if (!s) {
            return {
                success: false,
                error: 'User does not have any access to this server.',
            }
        }

        const actionPermissionsMap = {
            'edit': 'canEdit',
            'delete': 'canDelete',
            'view': 'canView',
            'rcon': 'canRcon'
        };

        const requiredPermission = actionPermissionsMap[action];

        if (!s.permissions[requiredPermission] && !s.permissions?.owner) {
            return {
                success: false,
                error: `Lacking permissions, required perms are: 'owner' or '${requiredPermission}'.`,
            }
        }

        return {
            success: true,
            error: 'User has the required permissions.',
            perms: s.permissions
        }
    }
}