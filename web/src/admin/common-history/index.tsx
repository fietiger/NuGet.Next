
import UserSelect from '@/features/User/UserSelect';
import { PackageUpdateRecordbyUser } from '@/services/PackageUpdateRecordService';
import { PackageUpdateRecordResponse } from '@/types/package';
import { Avatar, Tooltip } from '@lobehub/ui';
import Divider from '@lobehub/ui/es/Form/components/FormDivider';
import { Button, Table } from 'antd';
import type { TableProps } from 'antd';
import { useEffect, useState } from 'react';
import { Flexbox } from 'react-layout-kit';



export const CommonHistory = () => {
    const columns: TableProps<PackageUpdateRecordResponse>['columns'] = [
        {
            title: '包Id',
            dataIndex: 'packageId',
            key: 'packageId'
        },
        {
            title: 'version',
            dataIndex: 'version',
            key: 'version',
        },
        {
            title: '操作类型',
            dataIndex: 'operationType',
            key: 'operationType',
        }, {
            title: '描述',
            dataIndex: 'operationDescription',
            key: 'operationDescription',
        }, {
            title: 'IP',
            dataIndex: 'operationIP',
            key: 'operationIP',
        }, {
            title: '操作人',
            dataIndex: 'user',
            key: 'user',
            render: (user) => {
                return (<>
                    <Tooltip title={user?.email}>
                        <Avatar src={user?.avatar} />
                    </Tooltip>
                </>)
            }
        },
        {
            title: '操作时间',
            dataIndex: 'operationTime',
            key: 'operationTime',
        }
    ];
    const [data, setData] = useState<PackageUpdateRecordResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [userId, setUserId] = useState<string[]>([]);

    async function loadData() {
        setLoading(true);
        try {
            const result = await PackageUpdateRecordbyUser(page, pageSize, userId);
            setData(result.items);
            setTotal(result.total);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, [page, pageSize]);

    return (
        <>
            <Flexbox horizontal style={{
                fontSize: 16,
                fontWeight: "bold",
                padding: 16,
            }}>
                <span>
                    操作记录
                </span>
                <span style={{
                    marginLeft: 'auto',
                    marginRight: 16,
                }}>
                    <UserSelect
                        virtual={true}
                        mode="multiple"
                        placeholder="选择用户"
                        width='150px'
                        model="tags"
                        value={userId} onChange={(v) => setUserId(v)} />
                    <Button
                        onClick={() => {
                            loadData();
                        }}
                        style={{
                            marginLeft: 8
                        }}>
                        查询
                    </Button>
                </span>
            </Flexbox>
            <Divider />
            <Table<PackageUpdateRecordResponse> columns={columns} dataSource={data}
                loading={loading}
                pagination={{
                    total: total,
                    current: page,
                    pageSize: pageSize,
                    onChange: (page, pageSize) => {
                        setPage(page);
                        setPageSize(pageSize);
                    }
                }}
            />
        </>
    )
}

export default CommonHistory;
