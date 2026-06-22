FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER root
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM node AS lobe
WORKDIR /src
COPY web .
RUN npm install -g yarn
RUN yarn
RUN yarn vite build --verbose

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