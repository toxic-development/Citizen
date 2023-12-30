export interface FiveMServer {
    id?: string;
    ip?: string;
    port?: number;
    name?: string;
    owner?: string;
    guild?: string;
    created?: any;

}

export interface DatabaseResponse {
    exists?: boolean;
    success?: boolean;
    error?: string | null;
    data?: any;
}