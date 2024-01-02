import Citizen from '../client/Citizen';
import { DatabaseResponse, GrantedServer } from '../types/db.interface';
import { UserModel } from '../models/user';

export class GateManager {

    public client: Citizen;

    constructor(client: Citizen) {
        this.client = client;
    }

    /**
     * Grants a user gated access to a server.
     * @param user The user to grant access to.
     * @param server The server to grant access to.
     * @param perms The permissions to grant.
     * @returns type: DatabaseResponse
     */
    public async addGatedAccess({ user, server, perms }: GrantedServer): Promise<DatabaseResponse> {

        if (!user || !server) return {
            success: false,
            error: 'Invalid user or server ID.'
        }

        if (!perms) return {
            success: false,
            error: 'Invalid permissions.'
        }

        let gatedAccess = await this.canViewServer({ user: user, server: server });

        if (gatedAccess.success) return {
            success: false,
            error: 'User already has access to this server.'
        }

        const db = await new UserModel({
            id: user,
            servers: {
                id: server,
                permissions: {
                    owner: perms.owner ? perms.owner : false,
                    canEdit: perms.canEdit ? perms.canEdit : false,
                    canDelete: perms.canDelete ? perms.canDelete : false,
                    canView: perms.canView ? perms.canView : false
                }
            }
        }).save().catch((e: Error) => {
            console.log(e.stack)

            return {
                success: false,
                error: e.message
            }
        });

        return {
            success: true,
            error: null,
            data: db
        }
    }

    public async removeGatedAccess({ user, server }: GrantedServer): Promise<DatabaseResponse> {

        if (!user || !server) return {
            success: false,
            error: 'Invalid user or server ID.'
        }

        let gatedAccess = await this.canViewServer({ user: user, server: server });

        if (!gatedAccess.success) return {
            success: false,
            error: 'User does not have access to this server.'
        }

        const db = await UserModel.findOne({ id: user, 'servers.id': server });

        await UserModel.findOneAndUpdate({ id: user, 'servers.id': server }, {
            $pull: {
                servers: {
                    id: server
                }
            }
        }).catch((e: Error) => {
            console.log(e.stack)

            return {
                success: false,
                error: e.message
            }
        });

        return {
            success: true,
            error: null,
            data: db
        }
    }

    public async isServerOwner({ user, server }: GrantedServer): Promise<DatabaseResponse> {

        const db = await UserModel.findOne({ id: user, 'servers.id': server });

        if (!db) return { success: false }

        const hasPermissions = db.servers.some((s: any) => {
            return s.id.toString() === server && s.permissions.owner;
        })

        if (!hasPermissions) return { success: false }

        return { success: true }
    }

    public async canViewServer({ user, server }: GrantedServer): Promise<DatabaseResponse> {

        const db = await UserModel.findOne({ id: user, 'servers.id': server });

        if (!db) return { success: false }

        const hasPermissions = db.servers.some((s: any) => {
            return s.id.toString() === server && s.permissions.canView;
        })

        if (!hasPermissions) return { success: false }

        return { success: true }
    }

    public async canEditServer({ user, server }: GrantedServer): Promise<DatabaseResponse> {

        if (!user || !server) return {
            success: false,
            error: 'Invalid user or server ID.'
        }

        const db = await UserModel.findOne({ id: user, 'servers.id': server });

        if (!db) return {
            success: false,
            error: 'No server found with that ID.'
        }

        const hasPermissions = db.servers.some((s: any) => {
            return s.id.toString() === server && s.permissions.canEdit;
        })

        if (!hasPermissions) return { success: false }

        return { success: true }
    }

    public async canDeleteServer({ user, server }: GrantedServer): Promise<DatabaseResponse> {

        if (!user || !server) return {
            success: false,
            error: 'Invalid user or server ID.'
        }

        const db = await UserModel.findOne({ id: user, 'servers.id': server });

        if (!db) return {
            success: false,
            error: 'No server found with that ID.'
        }

        const hasPermissions = db.servers.some((s: any) => {
            return s.id.toString() === server && s.permissions.canDelete;
        })

        if (!hasPermissions) return { success: false }

        return { success: true }
    }

    public async getServerPermissions({ user, server }: GrantedServer): Promise<DatabaseResponse> {

        if (!user || !server) return {
            success: false,
            error: 'Invalid user or server ID.'
        }

        const db = await UserModel.findOne({ id: user, 'servers.id': server });

        if (!db) return {
            success: false,
            error: 'No server found with that ID.'
        }

        if (db && db.servers && db.servers[0] && db.servers[0].permissions) {
            return {
                success: true,
                error: null,
                perms: {
                    owner: db.servers[0].permissions.owner,
                    canEdit: db.servers[0].permissions.canEdit,
                    canDelete: db.servers[0].permissions.canDelete,
                    canView: db.servers[0].permissions.canView
                }
            }
        }

        return {
            success: false,
            error: 'No permissions found.'
        }
    }
}