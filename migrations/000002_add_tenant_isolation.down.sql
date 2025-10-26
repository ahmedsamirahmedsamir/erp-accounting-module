-- Rollback tenant isolation from accounting tables

-- Remove foreign keys
ALTER TABLE chart_of_accounts DROP CONSTRAINT IF EXISTS chart_of_accounts_tenant_fk;
ALTER TABLE accounting_transactions DROP CONSTRAINT IF EXISTS accounting_transactions_tenant_fk;
ALTER TABLE accounting_transaction_lines DROP CONSTRAINT IF EXISTS accounting_transaction_lines_tenant_fk;

-- Remove indexes
DROP INDEX IF EXISTS idx_chart_of_accounts_tenant;
DROP INDEX IF EXISTS idx_accounting_transactions_tenant;
DROP INDEX IF EXISTS idx_accounting_transaction_lines_tenant;

-- Restore original unique constraints
ALTER TABLE chart_of_accounts DROP CONSTRAINT IF EXISTS chart_of_accounts_tenant_code_unique;
ALTER TABLE chart_of_accounts ADD CONSTRAINT chart_of_accounts_account_code_key UNIQUE(account_code);

ALTER TABLE accounting_transactions DROP CONSTRAINT IF EXISTS accounting_transactions_tenant_number_unique;
ALTER TABLE accounting_transactions ADD CONSTRAINT accounting_transactions_transaction_number_key UNIQUE(transaction_number);

-- Remove tenant_id columns
ALTER TABLE chart_of_accounts DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE accounting_transactions DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE accounting_transaction_lines DROP COLUMN IF EXISTS tenant_id;

