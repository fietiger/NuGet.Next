import { get, putJson } from "@/utils/fetch";

export interface ServerSettings {
    publicAccess: boolean;
    settingsFilePath?: string;
}

export interface PublicServerSettings {
    publicAccess: boolean;
}

const prefix = '/api/v3/settings';

export const getPublicServerSettings = () => {
    return get(`${prefix}/public`);
}

export const getServerSettings = () => {
    return get(prefix);
}

export const updateServerSettings = (settings: ServerSettings) => {
    return putJson(prefix, settings);
}
