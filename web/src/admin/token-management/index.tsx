import { useEffect, useState } from 'react';
import { Button, Input, message, Table, Tag } from 'antd';
import Divider from '@lobehub/ui/es/Form/components/FormDivider';
import { Snippet } from '@lobehub/ui';
import { Flexbox } from 'react-layout-kit';
import { AdminEnableUserKey, AdminUserKeyList } from '@/services/UserKeyService';

const TokenManagement = () => {
    const columns = [
        {
            title: 'Key',
            dataIndex: 'key',
            key: 'key',
            render: (key: string) => {
                return <Snippet language="text" copyable={true}>{key}</Snippet>
            },
        },
        {
            title: '用户',
            key: 'user',
            render: (_: any, item: any) => {
                return item.fullName ? `${item.fullName} (${item.username})` : item.username;
            }
        },
        {
            title: '创建时间',
            dataIndex: 'createdTime',
            key: 'createdTime',
        },
        {
            title: '状态',
            dataIndex: 'enabled',
            key: 'enabled',
            render: (enabled: boolean) => {
                return enabled ? <Tag color="green">已启用</Tag> : <Tag color="orange">已禁用</Tag>;
            }
        },
        {
            title: '操作',
            key: 'operation',
            width: '100px',
            render: (_: any, item: any) => {
                return (
                    <Button
                        danger={item.enabled}
                        onClick={() => {
                            enableKey(item.id);
                        }}
                    >
                        {item.enabled ? '禁用' : '启用'}
                    </Button>
                )
            }
        }
    ];

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [keyword, setKeyword] = useState('');

    async function loadData(currentPage = page, currentPageSize = pageSize, currentKeyword = keyword) {
        setLoading(true);
        try {
            const result = await AdminUserKeyList(currentKeyword, currentPage, currentPageSize);
            setData(result.items);
            setTotal(result.total);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, [page, pageSize]);

    async function enableKey(id: string) {
        try {
            const result = await AdminEnableUserKey(id);
            if (result.success) {
                message.success(result.message);
                loadData();
            } else {
                message.error(result.message);
            }
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <Flexbox>
            <Flexbox horizontal align="center" gap={12}>
                <span style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                }}>
                    Token管理
                </span>
                <Input.Search
                    allowClear
                    placeholder="搜索Key、用户名或昵称"
                    style={{ marginLeft: 'auto', width: 300 }}
                    value={keyword}
                    onChange={(event) => {
                        setKeyword(event.target.value);
                    }}
                    onSearch={(value) => {
                        setPage(1);
                        loadData(1, pageSize, value);
                    }}
                />
            </Flexbox>
            <Divider />
            <Table columns={columns} dataSource={data} loading={loading} pagination={{
                current: page,
                pageSize: pageSize,
                total: total,
                onChange: (page, pageSize) => {
                    setPage(page);
                    setPageSize(pageSize);
                }
            }} />
        </Flexbox>
    )
}

export default TokenManagement;
