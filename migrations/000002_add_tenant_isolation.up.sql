-- Add tenant isolation to accounting tables
-- This migration adds tenant_id columns and updates constraints for multi-tenant support

-- Add tenant_id to chart_of_accounts
ALTER TABLE chart_of_accounts ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Update the unique constraint to include tenant_id
ALTER TABLE chart_of_accounts DROP CONSTRAINT IF EXISTS chart_of_accounts_account_code_key;
ALTER TABLE chart_of_accounts ADD CONSTRAINT chart_of_accounts_tenant_code_unique UNIQUE(tenant_id, account_code);

-- Add index on tenant_id
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_tenant ON chart_of_accounts(tenant_id);

-- Add tenant_id to accounting_transactions
ALTER TABLE accounting_transactions ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Update the unique constraint to include tenant_id
ALTER TABLE accounting_transactions DROP CONSTRAINT IF EXISTS accounting_transactions_transaction_number_key;
ALTER TABLE accounting_transactions ADD CONSTRAINT accounting_transactions_tenant_number_unique UNIQUE(tenant_id, transaction_number);

-- Add index on tenant_id
CREATE INDEX IF NOT EXISTS idx_accounting_transactions_tenant ON accounting_transactions(tenant_id);

-- Add tenant_id to accounting_transaction_lines (inherited from transaction)
ALTER TABLE accounting_transaction_lines ADD COLUMN IF NOT EXISTS tenant_id UUID;
CREATE INDEX IF NOT EXISTS idx_accounting_transaction_lines_tenant ON accounting_transaction_lines(tenant_id);

-- Add foreign key to tenants table (if not already exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chart_of_accounts_tenant_fk') THEN
        ALTER TABLE chart_of_accounts ADD CONSTRAINT chart_of_accounts_tenant_fk 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'accounting_transactions_tenant_fk') THEN
        ALTER TABLE accounting_transactions ADD CONSTRAINT accounting_transactions_tenant_fk 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'accounting_transaction_lines_tenant_fk') THEN
        ALTER TABLE accounting_transaction_lines ADD CONSTRAINT accounting_transaction_lines_tenant_fk 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Make tenant_id NOT NULL after data migration (commented out - run manually after migrating data)
-- ALTER TABLE chart_of_accounts ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE accounting_transactions ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE accounting_transaction_lines ALTER COLUMN tenant_id SET NOT NULL;

