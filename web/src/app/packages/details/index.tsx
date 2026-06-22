import { DownloadPackageFile, PackageInfo } from "@/services/PackageService";
import { PackageDetailsState } from "@/types/package";
import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { useParams } from "react-router-dom";
import { Spin, Result, Row, Col, Card, Tabs, message } from "antd";
import { DownloadOutlined, HistoryOutlined, GlobalOutlined, GithubOutlined, FileTextOutlined, CloudDownloadOutlined, GiftOutlined } from '@ant-design/icons';
import { Image, Markdown, Snippet, Tag } from "@lobehub/ui";
import { Flexbox } from 'react-layout-kit';
import './index.css'


const { TabPane } = Tabs;

const PackageDetails = () => {
    const { id, version } = useParams();
    // const navigate = useNavigate();
    const [detail, setDetail] = useState<PackageDetailsState>();
    const [loading, setLoading] = useState(false);

    async function loadingData() {
        if (id) {
            try {
                const packages = await PackageInfo(id, version);
                setDetail(packages);
            } finally {
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        setLoading(true);
        loadingData();
    }, [id, version]);

    const getPackageDownloadUrl = () => {
        if (!detail) {
            return '#';
        }

        return detail.packageDownloadUrl ?? location.origin + '/v3/package/' +
            detail.package.id + '/' +
            detail.package.normalizedVersionString + '/' +
            `${detail.package.id}.${detail.package.normalizedVersionString}.nupkg`;
    };

    const handlePackageDownload = async (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();

        if (!detail) {
            return;
        }

        try {
            await DownloadPackageFile(
                getPackageDownloadUrl(),
                `${detail.package.id}.${detail.package.normalizedVersionString}.nupkg`
            );
        } catch (error) {
            console.error(error);
            message.error('下载失败，请确认已登录或 token 可用');
        }
    };

    if (loading) {
        return <>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }}>
                <Spin tip="Loading..." />
            </div>
        </>;
    }

    if (!detail?.found) {
        return (
            <Result
                status="404"
                title="抱歉，没有找到包。"
                subTitle={`找不到包 '${id}'.`}
                extra={
                    <><p>您可以尝试在 <a href={`https://www.nuget.org/packages?q=${encodeURIComponent(id ?? "")}`} target="_blank" rel="noopener noreferrer">nuget.org</a> 上搜索包。</p>
                        <p>觉得有问题？可以查看我们的 <a href="https://loic-sharma.github.io/BaGet/" target="_blank" rel="noopener noreferrer">文档</a> 或在我们的 <a href="https://github.com/loic-sharma/BaGet/issues" target="_blank" rel="noopener noreferrer">GitHub 项目</a> 上寻求帮助。</p>
                    </>
                }
            />
        );
    }

    return (
        <Row gutter={16} style={{
            margin: '8px',

        }}>
            <Col span={14}>
                <Card title={<Flexbox
                    horizontal
                    style={{
                        padding: '8px 0',
                        alignItems: 'center',

                    }}
                >
                    <Image
                        preview={false}
                        style={{
                            width: 64,
                            height: 64,
                            marginRight: 16,
                        }}

                        src={detail.iconUrl}
                        fallback="/images/default-package-icon-256x256.png"
                        className="img-responsive"
                        onError={(e) => e.currentTarget.src = "/images/default-package-icon-256x256.png"}
                        alt="The package icon" />
                    <h1>
                        {detail.package.id}
                    </h1>
                    <span style={{
                        marginLeft: 'auto',
                        fontSize: '1.5rem',
                    }}>
                        {detail.package.normalizedVersionString}
                    </span>
                </Flexbox>}>
                    <>
                        {detail.dependencyGroups.map((group) => {
                            return (<Tag
                                color="blue"
                                key={group.name} style={{
                                    margin: '4px',
                                    fontStyle: 'italic',
                                }}>{group.name}</Tag>
                            )
                        })}
                    </>
                    <Tabs defaultActiveKey="cake">
                        <TabPane tab=".NET CLI" key="dotnet-cli">
                            <Snippet
                                lang="bash"
                                copyable={true}
                                symbol=">"
                                spotlight={true}
                            >
                                {`dotnet add package ${detail.package.id} --version ${detail.package.normalizedVersionString}`}
                            </Snippet>
                        </TabPane>
                        <TabPane tab="Package Manager" key="package-manager">
                            <Snippet
                                lang="bash"
                                copyable={true}
                                symbol="PM> "
                                spotlight={true}
                            >
                                {`NuGet\\Install-Package ${detail.package.id} -Version  ${detail.package.normalizedVersionString}`}
                            </Snippet>
                        </TabPane>
                        <TabPane tab="PackageRefernce" key="package-refernce">
                            <Snippet
                                lang="xml"
                                copyable={true}
                                spotlight={true}
                            >
                                {`<PackageReference Include="${detail.package.id}" Version="${detail.package.normalizedVersionString}" />`}
                            </Snippet>
                        </TabPane>
                        <TabPane tab="Paket CLI" key="paket-cli">
                            <Snippet
                                lang="bash"
                                symbol="> "
                                copyable={true}
                                spotlight={true}
                            >
                                {`paket add "${detail.package.id}"  --version "${detail.package.normalizedVersionString}"`}
                            </Snippet>
                        </TabPane>
                        <TabPane tab="Script & Interactive" key="script-interactive">
                            <Snippet
                                lang="bash"
                                copyable={true}
                                spotlight={true}
                                symbol="> #r "
                            >
                                {`"nuget: ${detail.package.id}, ${detail.package.normalizedVersionString}"`}
                            </Snippet>
                        </TabPane>
                    </Tabs>

                    <Tabs style={{
                        marginTop: '50px',
                    }} defaultActiveKey="readme">
                        <TabPane tab="Readme" key="readme">
                            <Markdown
                                className="markdown"
                                fullFeaturedCodeBlock={true}
                                componentProps={
                                    {
                                        a: {
                                            rel: '',
                                            target: '_self',
                                        },
                                        img: {
                                            inStep: true,
                                            cover: true,
                                            alwaysShowActions: true,
                                            borderless: true,
                                            preview: false,
                                            style: {
                                                maxWidth: 'max-content',
                                            }
                                        }
                                    }
                                }
                                variant="chat">
                                {(detail?.readme.trim() === "") ? "这个包没有README.md文件" : detail.readme}
                            </Markdown>
                        </TabPane>
                        <TabPane tab="Used By" key="2">
                            {!detail.isDotnetTemplate && !detail.isDotnetTool && (
                                <>
                                    {detail.usedBy.length === 0 ? (
                                        <p> 没有包依赖于{detail.package.id}.</p>
                                    ) : (
                                        <div>
                                            <p>显示依赖的前20个包 {detail.package.id}.</p>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Packages</th>
                                                        <th>Downloads</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {detail.usedBy.map((pkg) => (
                                                        <tr key={pkg.id}>
                                                            <td>
                                                                <a href={`/packages/${pkg.id}`}>{pkg.id}</a>
                                                                <div>{pkg.description}</div>
                                                            </td>
                                                            <td>
                                                                <DownloadOutlined />
                                                                <span>{pkg.totalDownloads.toLocaleString()}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </>
                            )}
                        </TabPane>
                        <TabPane tab="Dependencies" key="3">
                            {detail.dependencyGroups.length === 0 ? (
                                <p>This package has no dependencies.</p>
                            ) : (
                                detail.dependencyGroups.map((group) => (
                                    <div key={group.name}>
                                        <h4>{group.name}</h4>
                                        <ul>
                                            {group.dependencies.length === 0 ? (
                                                <li>No dependencies.</li>
                                            ) : (
                                                group.dependencies.map((dependency) => (
                                                    <li key={dependency.packageId}>
                                                        <a href={`/packages/${dependency.packageId}`}>{dependency.packageId}</a>
                                                        <span> {dependency.versionSpec}</span>
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                    </div>
                                ))
                            )}
                        </TabPane>
                        <TabPane tab="Versions" key="4">
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
                                            <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Version</th>
                                            <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Downloads</th>
                                            <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Last updated</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detail.versions.map((version, index) => (
                                            <tr key={version.version} className={version.selected ? "bg-info" : ""} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                                                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}><a href={`/packages/${detail.package.id}/${version.version.version}`}>{version.version.version}</a></td>
                                                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{version.downloads.toLocaleString()}</td>
                                                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{new Date(version.lastUpdated).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </TabPane>
                    </Tabs>
                </Card>
            </Col>

            <Col span={6}>
                <Card title="信息">
                    <ul>
                        <li>
                            <HistoryOutlined /> 最后一次更新 {new Date(detail.lastUpdated).toLocaleDateString()}
                        </li>
                        {detail.package.projectUrlString && (
                            <li>
                                <GlobalOutlined /> <a href={detail.package.projectUrlString}>Project URL</a>
                            </li>
                        )}
                        {detail.package.repositoryUrlString && (
                            <li>
                                <GithubOutlined /> <a href={detail.package.repositoryUrlString}>Source code</a>
                            </li>
                        )}
                        {detail.licenseUrl && (
                            <li>
                                <FileTextOutlined /> <a href={detail.licenseUrl}>License</a>
                            </li>
                        )}
                        <li>
                            <CloudDownloadOutlined /> <a
                                href={getPackageDownloadUrl()}
                                onClick={handlePackageDownload}>下载</a>
                        </li>
                    </ul>
                </Card>

                <Card style={{
                    marginTop: '16px',
                }} title="统计数据">
                    <ul>
                        <li>
                            <DownloadOutlined /> {detail.totalDownloads.toLocaleString()} 下载总数
                        </li>
                        <li>
                            <GiftOutlined /> {detail.package.downloads.toLocaleString()} 本版本下载总数
                        </li>
                    </ul>
                </Card>

                {detail.package.authors.length > 0 && (
                    <Card style={{
                        marginTop: '16px',
                    }} title="作者">
                        {detail.package.authors.map(x => (
                            <Tag key={x}
                                color="blue"
                                style={{
                                    margin: '4px',
                                    fontStyle: 'italic',
                                }}>{x}</Tag>
                        ))}
                    </Card>
                )}
            </Col>
        </Row >
    );
}

export default PackageDetails;
