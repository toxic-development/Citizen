export interface FiveMServer {
    id?: string;
    ip?: string;
    port?: number;
    name?: string;
    created?: any;
    user?: string;
    type?: 'fivem' | 'redm';
    guild?: string;
}

export interface GrantedServerParams {
    user: string,
    server: string,
    perms?: {
        owner: boolean
        canEdit?: boolean
        canDelete?: boolean
        canView?: boolean
    },
}

export interface GrantedServer {
    user: string
    server: string
    type?: 'fivem' | 'redm'
    perms?: GrantedServerPerms
    action?: 'edit' | 'delete' | 'view' | 'rcon'
}

export interface GrantedServerPerms {
    owner: boolean
    canEdit: boolean
    canDelete?: boolean
    canView?: boolean
    canRcon?: boolean
    [key: string]: boolean | undefined;
}

export interface DatabaseResponse {
    exists?: boolean;
    success?: boolean;
    error?: string | null;
    data?: any;
    perms?: GrantedServerPerms
    needed?: string;
}

export interface GatedCheckResponse {
    success: boolean;
    error?: string | null;
    user?: string;
    owner?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    canView?: boolean;
    canRcon?: boolean;
}