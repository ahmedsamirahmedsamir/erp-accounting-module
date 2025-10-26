DROP TRIGGER IF EXISTS update_accounting_transactions_updated_at ON accounting_transactions;
DROP TRIGGER IF EXISTS update_chart_of_accounts_updated_at ON chart_of_accounts;
DROP TABLE IF EXISTS accounting_transaction_lines CASCADE;
DROP TABLE IF EXISTS accounting_transactions CASCADE;
DROP TABLE IF EXISTS chart_of_accounts CASCADE;
