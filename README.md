<div align="center"><a name="readme-top"></a>

<img height="160" src="https://avatars.githubusercontent.com/u/163431636?s=400&u=8221ed1987d773400b0e232258e55470cd952536&v=4">

<h1>NuGet Next</h1>

NuGet 全新版本，提供更多权限管理。

[![][github-release-shield]][github-release-link]
[![][github-releasedate-shield]][github-releasedate-link]<br/>
[![][github-contributors-shield]][github-contributors-link]
[![][github-forks-shield]][github-forks-link]
[![][github-stars-shield]][github-stars-link]
[![][github-issues-shield]][github-issues-link]
[![][github-license-shield]][github-license-link]

[Changelog](./CHANGELOG.md) · [Report Bug][github-issues-link] · [Request Feature][github-issues-link]

![](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

</div>

[github-release-shield]: https://img.shields.io/github/v/release/AIDotNet/NuGet.Next?color=369eff&labelColor=black&logo=github&style=flat
[github-release-link]: https://github.com/AIDotNet/NuGet.Next/releases
[github-releasedate-shield]: https://img.shields.io/github/release-date/AIDotNet/NuGet.Next?color=black&labelColor=black&style=flat
[github-releasedate-link]: https://github.com/AIDotNet/NuGet.Next/releases
[github-contributors-shield]: https://img.shields.io/github/contributors/AIDotNet/NuGet.Next?color=c4f042&labelColor=black&style=flat
[github-contributors-link]: https://github.com/AIDotNet/NuGet.Next/graphs/contributors
[github-forks-shield]: https://img.shields.io/github/forks/AIDotNet/NuGet.Next?color=8ae8ff&labelColor=black&style=flat
[github-forks-link]: https://github.com/AIDotNet/NuGet.Next/network/members
[github-stars-shield]: https://img.shields.io/github/stars/AIDotNet/NuGet.Next?color=ffcb47&labelColor=black&style=flat
[github-stars-link]: https://github.com/AIDotNet/NuGet.Next/network/stargazers
[github-issues-shield]: https://img.shields.io/github/issues/AIDotNet/NuGet.Next?color=ff80eb&labelColor=black&style=flat
[github-issues-link]: https://github.com/AIDotNet/NuGet.Next/issues
[github-license-shield]: https://img.shields.io/github/license/AIDotNet/NuGet.Next?color=white&labelColor=black&style=flat
[github-license-link]: https://github.com/AIDotNet/NuGet.Next/blob/main/LICENSE


NuGet 最新版开源私有化包管理，我们基于BaGet的基础之上增加了更多的功能，并且对中国市场做更多兼容，比如国产化支持。

## 功能介绍

- 支持用户管理
- 支持包管理溯源
- 支持包管理
- 用户支持自定义Key
- 支持SqlServer数据库
- 支持PostgreSql数据库
- 支持MySql数据库
- 支持DM（达梦）数据库
- 支持迁移BaGet原有数据

## 从BaGet现有数据迁移

### 迁移BaGet数据到NuGet Next

 请注意，NuGet Next是基于BaGet的基础之上增加了更多的功能，
 所以我们只需要启动`RunMigrationsAtStartu:true`迁移，
 然后数据库连接字符串指向BaGet的数据库即可。


## 快速部署

使用docker compose快速部署

```yaml
version: '3.8'
services:
  nuget.next:
    image: ${DOCKER_IMAGE:-nuget-next}
    build:
      context: .
      dockerfile: src/NuGet.Next/Dockerfile
    container_name: nuget-next
    ports:
      - "5000:8080"
    volumes:
      - ./nuget:/app/data # 请注意手动创建data目录，负责在Linux下可能出现权限问题导致无法写入
    environment:
      - Database:Type=SqLite
      - Database:ConnectionString=Data Source=/app/data/nuget.db # 数据库连接字符串
      - Mirror:Enabled=true # 是否启用镜像源
      - Mirror:PackageSource=https://api.nuget.org/v3/index.json # 镜像源，如果本地没有会自动从镜像源拉取
      - RunMigrationsAtStartup:true # 是否在启动时运行迁移，如果是第一次启动请设置为true

```

```shell
docker-compose up -d
```

### 国产化支持

```yaml
version: '3.8'
services:
  nuget.next:
    image: ${DOCKER_IMAGE:-nuget-next}
    build:
      context: .
      dockerfile: src/NuGet.Next/Dockerfile
    container_name: nuget-next
    ports:
      - "5000:8080"
    volumes:
      - ./nuget:/app/data # 请注意手动创建data目录，负责在Linux下可能出现权限问题导致无法写入
    environment:
      - Database:Type=DM # 达梦数据库
      - Database:ConnectionString=Server=localhost;User id=SYSDBA;PWD=SYSDBA;DATABASE=NUGET # 数据库连接字符串
      - Mirror:Enabled=true # 是否启用镜像源
      - Mirror:PackageSource=https://api.nuget.org/v3/index.json # 镜像源，如果本地没有会自动从镜像源拉取
      - RunMigrationsAtStartup:true # 是否在启动时运行迁移，如果是第一次启动请设置为true

```

```shell
docker-compose up -d
```
### PostgreSql数据库


```yaml
version: '3.8'
services:
  nuget.next:
    image: ${DOCKER_IMAGE:-nuget-next}
    build:
      context: .
      dockerfile: src/NuGet.Next/Dockerfile
    container_name: nuget-next
    ports:
      - "5000:8080"
    volumes:
      - ./nuget:/app/data # 请注意手动创建data目录，负责在Linux下可能出现权限问题导致无法写入
    environment:
      - Database:Type=PostgreSql
      - Database:ConnectionString=Host=postgres;Port=5432;Database=nuget-next;Username=token;Password=dd666666;
      - Mirror:Enabled=true # 是否启用镜像源
      - Mirror:PackageSource=https://api.nuget.org/v3/index.json # 镜像源，如果本地没有会自动从镜像源拉取
      - RunMigrationsAtStartup=true # 是否在启动时运行迁移，如果是第一次启动请设置为true

```

```shell
docker-compose up -d
```

### MySql数据库


```yaml
version: '3.8'
services:
  nuget.next:
    image: ${DOCKER_IMAGE:-nuget-next}
    build:
      context: .
      dockerfile: src/NuGet.Next/Dockerfile
    container_name: nuget-next
    ports:
      - "5000:8080"
    volumes:
      - ./nuget:/app/data # 请注意手动创建data目录，负责在Linux下可能出现权限问题导致无法写入
    environment:
      - Database:Type=MySql
      - Database:ConnectionString=Server=mysql;Port=3306;Database=nuget-next;Uid=root;Pwd=dd666666;
      - Mirror:Enabled=true # 是否启用镜像源
      - Mirror:PackageSource=https://api.nuget.org/v3/index.json # 镜像源，如果本地没有会自动从镜像源拉取
      - RunMigrationsAtStartup=true # 是否在启动时运行迁移，如果是第一次启动请设置为true

```

```shell
docker-compose up -d
```

### SqlServer数据库

```yaml
version: '3.8'
services:
  nuget.next:
    image: ${DOCKER_IMAGE:-nuget-next}
    build:
      context: .
      dockerfile: src/NuGet.Next/Dockerfile
    container_name: nuget-next
    ports:
      - "5000:8080"
    volumes:
      - ./nuget:/app/data # 请注意手动创建data目录，负责在Linux下可能出现权限问题导致无法写入
    environment:
      - Database:Type=SqlServer
      - Database:ConnectionString=Server=sqlserver;Database=nuget-next;User Id=sa;Password=dd666666;
      - Mirror:Enabled=true # 是否启用镜像源
      - Mirror:PackageSource=https://api.nuget.org/v3/index.json # 镜像源，如果本地没有会自动从镜像源拉取
      - RunMigrationsAtStartup=true # 是否在启动时运行迁移，如果是第一次启动请设置为true

```

```shell
docker-compose up -d
```

## 使用说明

- 默认用户名：admin
- 默认密码：Aa123456.
- 下载 `.nupkg` 需要提供 token。用户可在“Key管理”中创建 Key，浏览器下载会自动携带登录 token；NuGet 客户端可使用 Basic 凭证，把用户名设置为任意非空值、密码设置为用户 Key：

```shell
dotnet nuget add source http://localhost:5000/v3/index.json --name NuGetNext --username token --password <user-key> --store-password-in-clear-text
```

- 管理员可在后台“操作记录”中查看下载审计，包括包、版本、用户、IP 和 token 类型。

## 发布到自己的 Docker Hub

GitHub Actions 会读取仓库变量 `DOCKER_IMAGE` 作为镜像名，例如 `your-dockerhub-name/nuget-next`。在 fork 仓库的 `Settings -> Secrets and variables -> Actions` 中配置：

- Variables: `DOCKER_IMAGE=your-dockerhub-name/nuget-next`
- Secrets: `DOCKERHUB_USERNAME=your-dockerhub-name`
- Secrets: `DOCKERHUB_TOKEN=<Docker Hub Access Token>`

推送到 `main` 后会发布两个标签：`latest` 和当前提交 SHA。


## 联系我们

- [官方网站](https://www.token-ai.cn)
- [GitHub](https://github.com/AIDotNet)
- [Gitee](https://gitee.com/aidotnet)
- [邮箱](mailto:239573049qq.com)
- [QQ群](https://qm.qq.com/q/1mmVx7zMjC)
