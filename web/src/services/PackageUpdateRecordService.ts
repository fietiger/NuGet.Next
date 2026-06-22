import { get } from "@/utils/fetch"


export const PackageUpdateRecordbyUser = (page: number, pageSize: number, userId: string[]) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (userId) {
        userId.forEach(id => {
            params.append('userId', id);
        });
    }
    return get('/api/v3/package-update-record/by-user?' + params.toString())
}
