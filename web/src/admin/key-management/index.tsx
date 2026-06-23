import { Button, Input, message, Table } from 'antd';
import { useEffect, useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import Divider from '@lobehub/ui/es/Form/components/FormDivider';
import { Snippet } from '@lobehub/ui';
import { AdminEnableUserKey, AdminUserKeyList } from '@/services/UserKeyService';

type UserKeyItem = {
    id: string;
    key: string;
    createdTime: string;
    userId: string;
    username: string;
    fullName: string;
    enabled: boolean;
};

const AdminKeyManagement = () => {
    const columns = [
        {
            title: 'Key',
            dataIndex: 'key',
            key: 'key',
            render: (key: string) => <Snippet language="text" copyable={true}>{key}</Snippet>,
        },
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: '昵称',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: '创建时间',
            dataIndex: 'createdTime',
            key: 'createdTime',
        },
        {
            title: '是否可用',
            dataIndex: 'enabled',
            key: 'enabled',
            render: (enabled: boolean) => enabled ? '是' : '否',
        },
        {
            title: '操作',
            key: 'action',
            render: (_: unknown, record: UserKeyItem) => (
                <Button onClick={() => toggleKey(record.id)}>
                    {record.enabled ? '禁用' : '启用'}
                </Button>
            ),
        },
    ];

    const [data, setData] = useState<UserKeyItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [keyword, setKeyword] = useState('');

    async function loadData() {
        setLoading(true);
        try {
            const result = await AdminUserKeyList(keyword, page, pageSize);
            setData(result.items);
            setTotal(result.total);
        } finally {
            setLoading(false);
        }
    }

    async function toggleKey(id: string) {
        try {
            const result = await AdminEnableUserKey(id);
            if (result.success) {
                message.success('操作成功');
                await loadData();
            } else {
                message.error(result.message);
            }
        } catch (e) {
            console.error(e);
            message.error('操作失败');
        }
    }

    useEffect(() => {
        loadData();
    }, [page, pageSize]);

    return (
        <Flexbox>
            <Flexbox horizontal style={{
                fontSize: 16,
                fontWeight: 'bold',
                padding: 16,
            }}>
                <span>Key管理</span>
                <span style={{
                    marginLeft: 'auto',
                    marginRight: 16,
                }}>
                    <Input
                        placeholder="搜索 Key、用户名或昵称"
                        style={{
                            width: 220,
                            marginRight: 8,
                        }}
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    <Button onClick={() => loadData()}>查询</Button>
                </span>
            </Flexbox>
            <Divider />
            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                rowKey="id"
                pagination={{
                    current: page,
                    pageSize,
                    total,
                    onChange: (nextPage, nextPageSize) => {
                        setPage(nextPage);
                        setPageSize(nextPageSize);
                    },
                }}
            />
        </Flexbox>
    );
};

export default AdminKeyManagement;
