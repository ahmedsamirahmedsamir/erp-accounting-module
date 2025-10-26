# ERP Accounting Module

A comprehensive accounting and financial management module for the LinearBits ERP system.

## Features

- General ledger management
- Accounts payable and receivable
- Financial reporting
- Budget management
- Tax calculations
- Bank reconciliation
- Financial analytics

## Installation

This module can be installed through the LinearBits ERP Marketplace or directly from GitHub.

## Usage

Once installed, the Accounting module will be available in your ERP navigation menu under "Accounting".

## API Endpoints

- `GET /api/v1/accounting/accounts` - List chart of accounts
- `POST /api/v1/accounting/accounts` - Create account
- `GET /api/v1/accounting/transactions` - List transactions
- `POST /api/v1/accounting/transactions` - Create transaction
- `GET /api/v1/accounting/invoices` - List invoices
- `POST /api/v1/accounting/invoices` - Create invoice
- `GET /api/v1/accounting/payments` - List payments
- `POST /api/v1/accounting/payments` - Record payment

## Permissions

- `accounting.accounts.view` - View chart of accounts
- `accounting.accounts.create` - Create accounts
- `accounting.accounts.edit` - Edit accounts
- `accounting.transactions.view` - View transactions
- `accounting.transactions.create` - Create transactions
- `accounting.invoices.view` - View invoices
- `accounting.invoices.create` - Create invoices
- `accounting.payments.view` - View payments
- `accounting.payments.create` - Record payments

## Database Tables

This module uses the following database tables:
- `chart_of_accounts` - Chart of accounts
- `accounting_transactions` - General ledger transactions
- `accounting_invoices` - Invoice records
- `accounting_payments` - Payment records
- `accounting_budgets` - Budget definitions
- `accounting_reports` - Financial reports

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please open an issue on GitHub or contact the LinearBits team.
