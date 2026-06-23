ARG NODE_VERSION=24
ARG PNPM_VERSION=10.33.3

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER root
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM node:${NODE_VERSION}-bookworm-slim AS lobe
ARG PNPM_VERSION
WORKDIR /src
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
COPY web/package.json web/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY web .
RUN pnpm build

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["src/NuGet.Next/NuGet.Next.csproj", "src/NuGet.Next/"]
COPY ["src/NuGet.Next.Core/NuGet.Next.Core.csproj", "src/NuGet.Next.Core/"]
COPY ["src/NuGet.Next.Protocol/NuGet.Next.Protocol.csproj", "src/NuGet.Next.Protocol/"]
COPY ["src/NuGet.Next.DM/NuGet.Next.DM.csproj", "src/NuGet.Next.DM/"]
COPY ["src/NuGet.Next.MySql/NuGet.Next.MySql.csproj", "src/NuGet.Next.MySql/"]
COPY ["src/NuGet.Next.PostgreSql/NuGet.Next.PostgreSql.csproj", "src/NuGet.Next.PostgreSql/"]
COPY ["src/NuGet.Next.Sqlite/NuGet.Next.Sqlite.csproj", "src/NuGet.Next.Sqlite/"]
COPY ["src/NuGet.Next.SqlServer/NuGet.Next.SqlServer.csproj", "src/NuGet.Next.SqlServer/"]
RUN dotnet restore "src/NuGet.Next/NuGet.Next.csproj"
COPY . .
WORKDIR "/src/src/NuGet.Next"
RUN dotnet build "NuGet.Next.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "NuGet.Next.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY --from=lobe /src/dist ./wwwroot
ENTRYPOINT ["dotnet", "NuGet.Next.dll"]
