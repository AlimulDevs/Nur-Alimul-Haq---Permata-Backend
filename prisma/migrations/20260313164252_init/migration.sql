BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [email] NVARCHAR(255) NOT NULL,
    [password] NVARCHAR(255) NOT NULL,
    [full_name] NVARCHAR(255) NOT NULL,
    [role] NVARCHAR(20) NOT NULL CONSTRAINT [users_role_df] DEFAULT 'customer',
    [created_at] DATETIME2 NOT NULL CONSTRAINT [users_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[authors] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [bio] NVARCHAR(max),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [authors_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [authors_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[books] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [title] NVARCHAR(500) NOT NULL,
    [author_id] UNIQUEIDENTIFIER NOT NULL,
    [isbn] NVARCHAR(20) NOT NULL,
    [price] DECIMAL(12,2) NOT NULL,
    [stock] INT NOT NULL CONSTRAINT [books_stock_df] DEFAULT 0,
    [published_date] DATE,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [books_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [books_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [books_isbn_key] UNIQUE NONCLUSTERED ([isbn])
);

-- AddForeignKey
ALTER TABLE [dbo].[books] ADD CONSTRAINT [books_author_id_fkey] FOREIGN KEY ([author_id]) REFERENCES [dbo].[authors]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
