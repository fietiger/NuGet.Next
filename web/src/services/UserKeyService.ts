import { del, get, post, put } from "@/utils/fetch";


const prefix = '/api/v3/user-key';


export const CreateUserKey = () => {
    return post(prefix);
}

export const UserKeyList = () => {
    return get(`${prefix}`);
}

export const DeleteUserKey = (id: string) => {
    return del(prefix + '/' + id);
}

export const EnableUserKey = (id: string) => {
    return put(prefix + '/enable/' + id);
}

export const AdminUserKeyList = (keyword?: string, page: number = 1, pageSize: number = 10) => {
    const params = new URLSearchParams();
    if (keyword) {
        params.append('keyword', keyword);
    }
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    return get(`${prefix}/admin?${params.toString()}`);
}

export const AdminEnableUserKey = (id: string) => {
    return put(prefix + '/enable/' + id);
}
