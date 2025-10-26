package main

import "time"

// ChartOfAccount represents an account in the chart of accounts
type ChartOfAccount struct {
	ID              int       `json:"id"`
	AccountCode     string    `json:"account_code"`
	AccountName     string    `json:"account_name"`
	AccountType     string    `json:"account_type"` // asset, liability, equity, revenue, expense
	ParentID        *int      `json:"parent_id"`
	Description     *string   `json:"description"`
	IsActive        bool      `json:"is_active"`
	IsSystemAccount bool      `json:"is_system_account"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// AccountingTransaction represents a financial transaction
type AccountingTransaction struct {
	ID                int                         `json:"id"`
	TransactionNumber string                      `json:"transaction_number"`
	TransactionDate   time.Time                   `json:"transaction_date"`
	ReferenceType     *string                     `json:"reference_type"`
	ReferenceID       *int                        `json:"reference_id"`
	Description       *string                     `json:"description"`
	TotalAmount       float64                     `json:"total_amount"`
	Currency          string                      `json:"currency"`
	Status            string                      `json:"status"`
	CreatedBy         int                         `json:"created_by"`
	CreatedAt         time.Time                   `json:"created_at"`
	UpdatedAt         time.Time                   `json:"updated_at"`
	Lines             []AccountingTransactionLine `json:"lines,omitempty"`
}

// AccountingTransactionLine represents a line in a transaction
type AccountingTransactionLine struct {
	ID            int             `json:"id"`
	TransactionID int             `json:"transaction_id"`
	AccountID     int             `json:"account_id"`
	DebitAmount   float64         `json:"debit_amount"`
	CreditAmount  float64         `json:"credit_amount"`
	Description   *string         `json:"description"`
	CreatedAt     time.Time       `json:"created_at"`
	Account       *ChartOfAccount `json:"account,omitempty"`
}

// JournalEntry represents a journal entry
type JournalEntry struct {
	ID          int                `json:"id"`
	EntryNumber string             `json:"entry_number"`
	EntryDate   time.Time          `json:"entry_date"`
	Description *string            `json:"description"`
	Reference   *string            `json:"reference"`
	TotalDebit  float64            `json:"total_debit"`
	TotalCredit float64            `json:"total_credit"`
	Status      string             `json:"status"`
	CreatedBy   int                `json:"created_by"`
	ApprovedBy  *int               `json:"approved_by"`
	ApprovedAt  *time.Time         `json:"approved_at"`
	CreatedAt   time.Time          `json:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at"`
	Lines       []JournalEntryLine `json:"lines,omitempty"`
}

// JournalEntryLine represents a line in a journal entry
type JournalEntryLine struct {
	ID             int             `json:"id"`
	JournalEntryID int             `json:"journal_entry_id"`
	AccountID      int             `json:"account_id"`
	DebitAmount    float64         `json:"debit_amount"`
	CreditAmount   float64         `json:"credit_amount"`
	Description    *string         `json:"description"`
	CreatedAt      time.Time       `json:"created_at"`
	Account        *ChartOfAccount `json:"account,omitempty"`
}

// AccountingBudget represents a budget for an account
type AccountingBudget struct {
	ID              int             `json:"id"`
	BudgetName      string          `json:"budget_name"`
	FiscalYear      int             `json:"fiscal_year"`
	FiscalPeriod    int             `json:"fiscal_period"`
	AccountID       int             `json:"account_id"`
	BudgetAmount    float64         `json:"budget_amount"`
	ActualAmount    float64         `json:"actual_amount"`
	VarianceAmount  float64         `json:"variance_amount"`
	VariancePercent float64         `json:"variance_percent"`
	CreatedBy       int             `json:"created_by"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
	Account         *ChartOfAccount `json:"account,omitempty"`
}

// AccountBalance represents account balance for reports
type AccountBalance struct {
	AccountCode string  `json:"account_code"`
	AccountName string  `json:"account_name"`
	Balance     float64 `json:"balance"`
}

// AccountAmount represents account amount for reports
type AccountAmount struct {
	AccountCode string  `json:"account_code"`
	AccountName string  `json:"account_name"`
	Amount      float64 `json:"amount"`
}
