import { get, putJson } from "@/utils/fetch";

export interface ServerSettings {
    publicAccess: boolean;
    settingsFilePath?: string;
}

const prefix = '/api/v3/settings';

export const getServerSettings = () => {
    return get(prefix);
}

export const updateServerSettings = (settings: ServerSettings) => {
    return putJson(prefix, settings);
}
