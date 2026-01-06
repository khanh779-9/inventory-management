/* Run this script against master using a SQL Server login with database creation rights. */
IF DB_ID(N'InventoDb') IS NULL
BEGIN
    CREATE DATABASE [InventoDb];
END;
GO
