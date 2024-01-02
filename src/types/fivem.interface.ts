export interface InfoEndpoint {
    server: string;
    resources: string[];
    version: number;
    enhancedHostSupport?: boolean;
    requestSteamTicket?: "on" | "off" | "exclusive";
    vars: {
        gamename: string;
        sv_hostname: string;
        sv_projectName: string;
        sv_projectDesc: string;
        sv_maxClients: number;
        sv_enhancedHostSupport: string;
        sv_scriptHookAllowed: boolean;
        sv_authMinTrust?: number;
        sv_voiceServerMode?: string;
        sv_voiceToken?: string;
        sv_voiceDistance?: number;
        sv_voiceDebug?: boolean;
        sv_master?: string;
        sv_steam?: string;
        sv_pureLevel?: number;
        tags?: string;
        "txAdmin-version": string;
        onesync_enabled?: string;
        locale: string;
        sv_lan: string;
    }
}

export interface DynamicEndpoint {
    clients: number;
    gametype: string;
    hostname: string;
    mapname: string;
    sv_maxclients: string;
    iv: string;
}

export interface PlayersEndpoint {
    endpoint: string;
    data: Player[];
}

export interface Player {
    id: number;
    identifiers: Identifiers[]
    name: string;
    ping: number;
}

export interface Identifiers {
    [key: string]: string;
}