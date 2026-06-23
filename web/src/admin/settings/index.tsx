
import Divider from '@lobehub/ui/es/Form/components/FormDivider';
import { Button, message, Switch, Typography } from 'antd';
import { Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import {
    getServerSettings,
    ServerSettings,
    updateServerSettings
} from '@/services/ServerSettingsService';

const defaultSettings: ServerSettings = {
    publicAccess: false,
};

const AdminSettings = () => {
    const [settings, setSettings] = useState<ServerSettings>(defaultSettings);
    const [draft, setDraft] = useState<ServerSettings>(defaultSettings);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const changed = useMemo(() => {
        return settings.publicAccess !== draft.publicAccess;
    }, [draft.publicAccess, settings.publicAccess]);

    async function loadSettings() {
        setLoading(true);
        try {
            const result = await getServerSettings();
            setSettings(result);
            setDraft(result);
        } finally {
            setLoading(false);
        }
    }

    async function saveSettings() {
        setSaving(true);
        try {
            const result = await updateServerSettings(draft);
            setSettings(result);
            setDraft(result);
            message.success('设置已保存');
        } finally {
            setSaving(false);
        }
    }

    useEffect(() => {
        loadSettings();
    }, []);

    return (
        <Flexbox gap={16}>
            <Flexbox horizontal align="center">
                <span style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                }}>
                    系统设置
                </span>
                <Button
                    icon={<Save size={16} />}
                    loading={saving}
                    disabled={!changed || loading}
                    onClick={saveSettings}
                    style={{ marginLeft: 'auto' }}
                    type="primary">
                    保存
                </Button>
            </Flexbox>
            <Divider />
            <Flexbox gap={20} style={{ opacity: loading ? 0.6 : 1 }}>
                <Flexbox
                    horizontal
                    align="center"
                    gap={24}
                    style={{
                        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                        padding: '8px 0 24px',
                    }}>
                    <Flexbox gap={6} style={{ flex: 1 }}>
                        <Typography.Title level={5} style={{ margin: 0 }}>
                            Public Access
                        </Typography.Title>
                        <Typography.Text type="secondary">
                            允许匿名客户端下载 NuGet 包；匿名下载不会写入活动记录。
                        </Typography.Text>
                    </Flexbox>
                    <Switch
                        checked={draft.publicAccess}
                        checkedChildren="开启"
                        disabled={loading || saving}
                        onChange={(publicAccess) => setDraft({ ...draft, publicAccess })}
                        unCheckedChildren="关闭"
                    />
                </Flexbox>
                <Typography.Text type="secondary">
                    保存后立即生效，并写入 Storage 目录下的 appsettings.Local.json；Docker 环境保持 /app/data 卷映射即可持久化。使用 token 的下载仍会记录用户、IP 和 token 类型；上传、删除和后台管理仍需要登录权限。
                </Typography.Text>
                {settings.settingsFilePath && (
                    <Typography.Text copyable type="secondary">
                        配置文件：{settings.settingsFilePath}
                    </Typography.Text>
                )}
            </Flexbox>
        </Flexbox>
    );
}

export default AdminSettings;
