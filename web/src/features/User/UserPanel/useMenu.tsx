import { Icon } from '@lobehub/ui';
import {
  Book,
  Feather,
  LifeBuoy,
  LogOut,
  Mail,
  ChartCandlestick,
  AppWindow,
  KeySquare,
  Download,
  Key
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { MenuProps } from '@/components/Menu';
import { DOCUMENTS, EMAIL_SUPPORT, GITHUB_ISSUES, mailTo } from '@/const/url';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';
import { useLocation } from 'react-router-dom';

export const useMenu = () => {
  const router = useQueryRoute();
  const [isLogin, isLoginWithAuth, logout, user] = useUserStore((s) => [
    authSelectors.isLogin(s),
    authSelectors.isLoginWithAuth(s),
    s.logout,
    s.user,
  ]);
  const location = useLocation();

  function downloadNugetConfig() {

    const content = `<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <add key="NuGetNext" value="{source}/v3/index.json" />
  </packageSources>
  <packageSourceCredentials>
    <NuGetNext>
      <add key="Username" value="token" />
      <add key="ClearTextPassword" value="{user-key}" />
    </NuGetNext>
  </packageSourceCredentials>
</configuration>
`
    const blob = new Blob([content.replace('{source}', window.location.origin)], {
      type: 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'NuGet.config';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url));

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
      icon: <Icon icon={ChartCandlestick} />,
      key: 'common-history',
      label: '操作记录',
      onClick: () => {
        router.push('/common-history');
      },
    },
    {
      type: 'divider',
    },
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
    {
      icon: <Icon icon={Download} />,
      key: 'download-nuget-config',
      label: <span>下载 NuGet.config</span>,
      onClick: () => {
        downloadNugetConfig();
      }
    },
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
