FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY Inventory_Man_Sys_Be.csproj ./
RUN dotnet restore Inventory_Man_Sys_Be.csproj
COPY . ./
RUN dotnet publish Inventory_Man_Sys_Be.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Inventory_Man_Sys_Be.dll"]
