export interface Param {
    name: string;
    type: string;
}

export interface NativesByCategory {
    [category: string]: Native[];
}

export interface Native {
    name: string;
    params: Param[];
    results: string;
    description: string;
    examples: any[];
    hash: string;
    ns: string;
    jhash: string;
    manualHash: boolean;
    resultsDescription: string;
}

export interface CFXNative {
    name: string;
    apiset: string;
    params: Param[];
    results: string;
    description: string;
    examples: any[];
    hash: string;
    url: string;
    ns: string;
}