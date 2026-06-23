import { memo, useEffect, useState } from "react";
import { Flexbox } from 'react-layout-kit';
import { Button, Divider, message, Popconfirm, Table, Tag } from 'antd';
import { CreateUserKey, DeleteUserKey, UserKeyList } from "@/services/UserKeyService";
import { Snippet } from "@lobehub/ui";

const KeyManager = memo(() => {
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
            title: '创建时间',
            dataIndex: 'createdTime',
            key: 'createdTime',
        },
        {
            title: '是否可用',
            dataIndex: 'enabled',
            key: 'enabled',
            render: (enabled: boolean) => {
                return enabled ? <Tag color="green">已启用</Tag> : <Tag color="orange">待管理员启用</Tag>;
            }
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: any) => (
                <Flexbox horizontal>
                    <Popconfirm
                        title="确认删除?"
                        onConfirm={() => {
                            removeKey(record.id);
                        }}
                        okText="确认"
                        cancelText="取消"
                    >
                        <Button danger>删除</Button>
                    </Popconfirm>
                </Flexbox>
            ),
        }
    ];

    const [data, setData] = useState([]);

    const [loading, setLoading] = useState(true);

    async function loadData() {
        setLoading(true);
        try {
            const result = await UserKeyList();
            setData(result);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    async function addKey() {
        try {
            const result = await CreateUserKey();
            if (result.success) {
                message.success(result.message ?? '创建成功');
                loadData();
            } else {
                message.error(result.message);
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function removeKey(key: string) {
        try {
            const result = await DeleteUserKey(key);
            if (result.success) {
                loadData();
            } else {
                message.error(result.message);
            }
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <Flexbox style={{
            padding: '20px',
        }}>
            <Flexbox horizontal>
                <span>
                    Key管理
                </span>
                <span style={{
                    marginLeft: 'auto'
                }}>
                    <Button onClick={() => {
                        addKey();
                    }}>
                        添加Key
                    </Button>
                </span>
            </Flexbox>
            <Divider />
            <Table
                columns={columns}
                dataSource={data}
                loading={loading} />
        </Flexbox>
    )
});

KeyManager.displayName = 'KeyManager'

export default KeyManager;
