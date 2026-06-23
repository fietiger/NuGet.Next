import { Icon } from '@lobehub/ui';
import {
  Book,
  Feather,
  LifeBuoy,
  LogOut,
  Mail,
  AppWindow,
  KeySquare,
  Download,
  Key
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';
import { useEffect, useState } from 'react';
import type { MenuProps } from '@/components/Menu';
import { DOCUMENTS, EMAIL_SUPPORT, GITHUB_ISSUES, mailTo } from '@/const/url';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';
import { useLocation } from 'react-router-dom';
import { CreateUserKey, UserKeyList } from '@/services/UserKeyService';
import { getPublicServerSettings } from '@/services/ServerSettingsService';

type UserKeyItem = {
  key: string;
  enabled: boolean;
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&apos;');
}

export const useMenu = () => {
  const router = useQueryRoute();
  const [isLogin, isLoginWithAuth, logout, user] = useUserStore((s) => [
    authSelectors.isLogin(s),
    authSelectors.isLoginWithAuth(s),
    s.logout,
    s.user,
  ]);
  const location = useLocation();
  const [publicAccess, setPublicAccess] = useState(false);

  useEffect(() => {
    getPublicServerSettings()
      .then((settings) => {
        setPublicAccess(Boolean(settings?.publicAccess));
      })
      .catch((error) => {
        console.error(error);
        setPublicAccess(false);
      });
  }, []);

  async function getEnabledUserKey() {
    const keys = await UserKeyList() as UserKeyItem[];
    const enabledKey = keys.find((item) => item.enabled)?.key;

    if (enabledKey) {
      return enabledKey;
    }

    const result = await CreateUserKey();
    if (!result.success) {
      message.error(result.message ?? '创建 Key 失败');
      return null;
    }

    const refreshedKeys = await UserKeyList() as UserKeyItem[];
    const enabledKeyAfterCreate = refreshedKeys.find((item) => item.enabled)?.key;

    if (!enabledKeyAfterCreate) {
      message.warning(result.message ?? 'Key 已创建，请等待管理员启用');
      return null;
    }

    return enabledKeyAfterCreate;
  }

  async function downloadNugetConfig() {
    if (!isLogin) {
      message.warning('请先登录后下载 NuGet.config');
      router.push('/login');
      return;
    }

    let userKey: string | null = null;
    try {
      userKey = await getEnabledUserKey();
    } catch (error) {
      console.error(error);
      message.error('获取 Key 失败');
      return;
    }

    if (!userKey) {
      message.error('没有可用的 Key，请先在密钥管理中创建 Key，并等待管理员启用');
      return;
    }

    const username = user?.username?.trim();
    if (!username) {
      message.error('无法获取当前用户名，请重新登录后再试');
      return;
    }

    const source = `${window.location.origin}/v3/index.json`;
    const credentials = `
  <packageSourceCredentials>
    <NuGetNext>
      <add key="Username" value="${escapeXml(username)}" />
      <add key="ClearTextPassword" value="${escapeXml(userKey)}" />
    </NuGetNext>
  </packageSourceCredentials>`;

    const config = `<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <add key="NuGetNext" value="${escapeXml(source)}" />
  </packageSources>${credentials}
</configuration>
`

    const blob = new Blob([config], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'NuGet.config';
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      a.parentElement?.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);

  }

  const helps: MenuProps['items'] = [
    {
      children: [
        {
          icon: <Icon icon={Book} />,
          key: 'docs',
          label: (
            <Link to={DOCUMENTS} target={'_blank'}>
              文档
            </Link>
          ),
        },
        {
          icon: <Icon icon={Feather} />,
          key: 'feedback',
          label: (
            <Link to={GITHUB_ISSUES} target={'_blank'}>
              反馈
            </Link>
          ),
        },
        {
          icon: <Icon icon={Mail} />,
          key: 'email',
          label: (
            <Link to={mailTo(EMAIL_SUPPORT)} target={'_blank'}>
              邮件支持
            </Link>
          ),
        },
      ],
      icon: <Icon icon={LifeBuoy} />,
      key: 'help',
      label: '帮助',
    },
    {
      type: 'divider',
    },
  ];

  const settings: MenuProps['items'] = [
    {
      icon: <Icon icon={Key} />,
      key: 'change-password',
      label: '修改密码',
      onClick: () => {
        router.push('/change-password', {
          replace: true,
        });
      },
    },
    {
      icon: <Icon icon={KeySquare} />,
      key: 'key-manager',
      label: '密钥管理',
      onClick: () => {
        router.push('/key-manager');
      },
    }
  ]

  const adminItems: MenuProps['items'] = [
    ... (user?.role === 'admin' ? [
      {
        icon: <Icon icon={AppWindow} />,
        key: 'admin',
        label: location.pathname.includes('/admin') ? '首页' : '控制面板',
        onClick: () => {
          if (!location.pathname.includes('/admin')) {
            router.push('/admin', {
              replace: true,
            });
          } else {
            router.push('/', {
              replace: true,
            });
          }
        },
      },
    ] : [
      {
        icon: <Icon icon={AppWindow} />,
        key: 'current-package',
        label: '包管理',
        onClick: () => {
          router.push('/current-package', {
            replace: true,
          });
        },
      }])
  ];


  const mainItems = [
    {
      type: 'divider',
    },
    ...(publicAccess ? [{
      icon: <Icon icon={Download} />,
      key: 'download-nuget-config',
      label: <a href="/api/v3/nuget-config" download="NuGet.config">下载 NuGet.config</a>,
    }] : isLogin ? [{
      icon: <Icon icon={Download} />,
      key: 'download-nuget-config',
      label: <span>下载 NuGet.config</span>,
      onClick: () => {
        void downloadNugetConfig();
      }
    }] : []),
    ...(isLogin ? adminItems : []),
    ...(isLogin ? settings : []),
    ...helps,
  ].filter(Boolean) as MenuProps['items'];

  const logoutItems: MenuProps['items'] = isLoginWithAuth
    ? [
      {
        icon: <Icon icon={LogOut} />,
        key: 'logout',
        label: <span>退出登录</span>,
        onClick: () => {
          logout();
        }
      },
    ]
    : [
    ];

  return { logoutItems, mainItems };
};
