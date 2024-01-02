export interface FiveMServer {
    id?: string;
    ip?: string;
    port?: number;
    name?: string;
    owner?: string;
    guild?: string;
    created?: any;

}

export interface GrantedServerParams {
    user: string,
    server: string,
    perms?: {
        owner: boolean,
        canEdit?: boolean,
        canDelete?: boolean,
        canView?: boolean,
    },
}

export interface GrantedServer {
    user: string,
    server: string,
    perms?: GrantedServerParams['perms']
}

export interface DatabaseResponse {
    exists?: boolean;
    success?: boolean;
    error?: string | null;
    data?: any;
    perms?: GrantedServerParams['perms']
    needed?: string;
}