
import { memo } from "react";
import { Outlet } from "react-router-dom";
import { Layout, Menu, theme } from 'antd';
import './index.css'
import { Header } from "@lobehub/ui";
import { Package, User, Gauge, ChartCandlestick, Settings, KeyRound } from 'lucide-react'
import { useNavigate, useLocation } from "react-router-dom";
import React from "react";
import Avatar from "./Avatar";
import { useUserStore } from "@/store/user";
const { Content, Footer, Sider } = Layout;

const DesktopLayout = memo(() => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSignedIn, user] = useUserStore((s) => [s.isSignedIn, s.user]);

    const [selectedKey, setSelectedKey] = React.useState(location.pathname);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    React.useEffect(() => {
        if (!isSignedIn || user?.role !== 'admin') {
            navigate("/", { replace: true });
        }
    }, [isSignedIn, navigate, user?.role]);

    if (!isSignedIn || user?.role !== 'admin') {
        return null;
    }

    return (<Layout className="admin-layout" style={{
        height: '100vh',
    }}>
        <Sider
            collapsedWidth="0"
            onBreakpoint={(broken) => {
                console.log(broken);
            }}
            onCollapse={(collapsed, type) => {
                console.log(collapsed, type);
            }}
        >
            <Menu mode="inline"
                defaultSelectedKeys={[selectedKey]}
                selectedKeys={[selectedKey]}
                onSelect={({ key }) => {
                    if (key === "dashboard") {
                        setSelectedKey(key);
                        navigate("/admin");
                        return;
                    } else {
                        setSelectedKey(key);
                        navigate(`/admin/${key}`);
                    }
                }}
                style={{
                    background: colorBgContainer,
                    borderRadius: borderRadiusLG,
                    border: 'none',
                    height: '100%',
                }}
                items={[
                    {
                        key: 'dashboard',
                        icon: <Gauge />,
                        label: '控制面板',
                    },
                    {
                        key: 'user-management',
                        icon: <User />,
                        label: '用户管理',
                    },
                    {
                        key: 'package-management',
                        icon: <Package />,
                        label: '包管理',
                    },
                    {
                        key: 'token-management',
                        icon: <KeyRound />,
                        label: 'Token管理',
                    },
                    {
                        key: 'common-history',
                        icon: <ChartCandlestick />,
                        label: '操作记录',
                    },
                    {
                        key: 'settings',
                        icon: <Settings />,
                        label: '系统设置',
                    }
                ]} />
        </Sider>
        <Layout>
            <Header
                actions={<>
                    <Avatar />
                </>}
                style={{ padding: 0, background: colorBgContainer }} />
            <Content style={{ margin: '24px 16px 0' }}>
                <div
                    style={{
                        padding: 24,
                        minHeight: 360,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Outlet />
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
               ©{new Date().getFullYear()} Created by NuGet Next Team
            </Footer>
        </Layout>
    </Layout>
    )
})

DesktopLayout.displayName = 'DesktopLayout'

export default DesktopLayout;
