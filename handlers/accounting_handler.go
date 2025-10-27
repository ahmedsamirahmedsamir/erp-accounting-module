package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jmoiron/sqlx"
	sdk "github.com/linearbits/erp-backend/pkg/module-sdk"
	"go.uber.org/zap"
)

// AccountingHandler handles all accounting-related HTTP requests
type AccountingHandler struct {
	db     *sqlx.DB
	logger *zap.Logger
}

// NewAccountingHandler creates a new accounting handler
func NewAccountingHandler(db *sqlx.DB, logger *zap.Logger) *AccountingHandler {
	return &AccountingHandler{db: db, logger: logger}
}

// Chart of Accounts Handlers

// GetChartOfAccounts retrieves all chart of accounts
func (h *AccountingHandler) GetChartOfAccounts(w http.ResponseWriter, r *http.Request) {
	accountType := r.URL.Query().Get("type")
	isActive := r.URL.Query().Get("is_active")

	qb := sdk.NewQueryBuilder("SELECT * FROM chart_of_accounts WHERE 1=1")
	qb.AddOptionalCondition("account_type = $%d", accountType)
	if isActive != "" {
		qb.AddCondition("is_active = $%d", isActive == "true")
	}

	query, args := qb.Build()
	query += " ORDER BY account_code"

	var accounts []ChartOfAccount
	if err := h.db.Select(&accounts, query, args...); err != nil {
		h.logger.Error("Failed to fetch chart of accounts", zap.Error(err))
		sdk.WriteInternalError(w, "Failed to fetch chart of accounts")
		return
	}

	sdk.WriteSuccess(w, map[string]interface{}{
		"accounts": accounts,
		"count":    len(accounts),
	})
}

// CreateChartOfAccount creates a new chart of account
func (h *AccountingHandler) CreateChartOfAccount(w http.ResponseWriter, r *http.Request) {
	var req struct {
		AccountCode     string  `json:"account_code"`
		AccountName     string  `json:"account_name"`
		AccountType     string  `json:"account_type"`
		ParentID        *int    `json:"parent_id"`
		Description     *string `json:"description"`
		IsSystemAccount bool    `json:"is_system_account"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sdk.WriteBadRequest(w, "Invalid request body")
		return
	}

	// Validate required fields
	if err := sdk.ValidateRequired(map[string]interface{}{
		"account_code": req.AccountCode,
		"account_name": req.AccountName,
		"account_type": req.AccountType,
	}); err != nil {
		sdk.WriteBadRequest(w, err.Error())
		return
	}

	// Validate account type
	if err := sdk.ValidateEnum("account_type", req.AccountType,
		[]string{"asset", "liability", "equity", "revenue", "expense"}); err != nil {
		sdk.WriteBadRequest(w, err.Error())
		return
	}

	query := `
		INSERT INTO chart_of_accounts (account_code, account_name, account_type, parent_id, description, is_system_account)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, updated_at
	`

	var id int
	var createdAt, updatedAt time.Time

	err := h.db.QueryRow(query, req.AccountCode, req.AccountName, req.AccountType,
		req.ParentID, req.Description, req.IsSystemAccount).Scan(&id, &createdAt, &updatedAt)

	if err != nil {
		h.logger.Error("Failed to create chart of account", zap.Error(err))
		sdk.WriteInternalError(w, "Failed to create chart of account")
		return
	}

	sdk.WriteCreated(w, map[string]interface{}{
		"id":         id,
		"created_at": createdAt,
		"updated_at": updatedAt,
		"message":    "Chart of account created successfully",
	})
}

// UpdateChartOfAccount updates an existing chart of account
func (h *AccountingHandler) UpdateChartOfAccount(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		sdk.WriteBadRequest(w, "Invalid account ID")
		return
	}

	var req map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sdk.WriteBadRequest(w, "Invalid request body")
		return
	}

	// Check if account exists
	var exists bool
	err = h.db.Get(&exists, "SELECT EXISTS(SELECT 1 FROM chart_of_accounts WHERE id = $1)", id)
	if err != nil || !exists {
		sdk.WriteNotFound(w, "Account not found")
		return
	}

	// Build dynamic update (simplified - in production, properly validate each field)
	updates := []string{}
	args := []interface{}{}
	argIdx := 1

	if val, ok := req["account_name"]; ok {
		updates = append(updates, fmt.Sprintf("account_name = $%d", argIdx))
		args = append(args, val)
		argIdx++
	}
	if val, ok := req["description"]; ok {
		updates = append(updates, fmt.Sprintf("description = $%d", argIdx))
		args = append(args, val)
		argIdx++
	}
	if val, ok := req["is_active"]; ok {
		updates = append(updates, fmt.Sprintf("is_active = $%d", argIdx))
		args = append(args, val)
		argIdx++
	}

	if len(updates) == 0 {
		sdk.WriteBadRequest(w, "No fields to update")
		return
	}

	query := "UPDATE chart_of_accounts SET " + fmt.Sprintf("%s", updates[0])
	for i := 1; i < len(updates); i++ {
		query += ", " + updates[i]
	}
	query += fmt.Sprintf(" WHERE id = $%d", argIdx)
	args = append(args, id)

	_, err = h.db.Exec(query, args...)
	if err != nil {
		h.logger.Error("Failed to update chart of account", zap.Error(err))
		sdk.WriteInternalError(w, "Failed to update chart of account")
		return
	}

	sdk.WriteSuccess(w, map[string]interface{}{"message": "Account updated successfully"})
}

// DeleteChartOfAccount soft deletes a chart of account
func (h *AccountingHandler) DeleteChartOfAccount(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		sdk.WriteBadRequest(w, "Invalid account ID")
		return
	}

	// Soft delete
	_, err = h.db.Exec("UPDATE chart_of_accounts SET is_active = false WHERE id = $1", id)
	if err != nil {
		h.logger.Error("Failed to delete chart of account", zap.Error(err))
		sdk.WriteInternalError(w, "Failed to delete chart of account")
		return
	}

	sdk.WriteSuccess(w, map[string]interface{}{"message": "Account deleted successfully"})
}

// GetAccountingTransactions retrieves accounting transactions
func (h *AccountingHandler) GetAccountingTransactions(w http.ResponseWriter, r *http.Request) {
	startDate := r.URL.Query().Get("start_date")
	endDate := r.URL.Query().Get("end_date")
	status := r.URL.Query().Get("status")
	limit := r.URL.Query().Get("limit")

	if limit == "" {
		limit = "100"
	}

	qb := sdk.NewQueryBuilder("SELECT * FROM accounting_transactions WHERE 1=1")
	qb.AddOptionalCondition("transaction_date >= $%d", startDate)
	qb.AddOptionalCondition("transaction_date <= $%d", endDate)
	qb.AddOptionalCondition("status = $%d", status)

	query, args := qb.Build()
	query += " ORDER BY transaction_date DESC, created_at DESC LIMIT " + limit

	var transactions []AccountingTransaction
	if err := h.db.Select(&transactions, query, args...); err != nil {
		h.logger.Error("Failed to fetch transactions", zap.Error(err))
		sdk.WriteInternalError(w, "Failed to fetch transactions")
		return
	}

	sdk.WriteSuccess(w, map[string]interface{}{
		"transactions": transactions,
		"count":        len(transactions),
	})
}

// CreateAccountingTransaction creates a new accounting transaction
func (h *AccountingHandler) CreateAccountingTransaction(w http.ResponseWriter, r *http.Request) {
	var req struct {
		TransactionDate string                      `json:"transaction_date"`
		Description     *string                     `json:"description"`
		Currency        string                      `json:"currency"`
		Lines           []AccountingTransactionLine `json:"lines"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sdk.WriteBadRequest(w, "Invalid request body")
		return
	}

	if len(req.Lines) == 0 {
		sdk.WriteBadRequest(w, "At least one transaction line is required")
		return
	}

	if req.Currency == "" {
		req.Currency = "USD"
	}

	// Validate debits equal credits
	var totalDebits, totalCredits float64
	for _, line := range req.Lines {
		totalDebits += line.DebitAmount
		totalCredits += line.CreditAmount
	}

	if totalDebits != totalCredits {
		sdk.WriteBadRequest(w, "Total debits must equal total credits")
		return
	}

	transactionNumber := fmt.Sprintf("TXN-%d", time.Now().Unix())

	err := sdk.WithTransaction(h.db, func(tx *sqlx.Tx) error {
		var txnID int
		err := tx.QueryRow(`
			INSERT INTO accounting_transactions 
			(transaction_number, transaction_date, description, total_amount, currency, created_by)
			VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING id
		`, transactionNumber, req.TransactionDate, req.Description, totalDebits, req.Currency, 1).
			Scan(&txnID)
		if err != nil {
			return err
		}

		// Insert lines
		for _, line := range req.Lines {
			_, err = tx.Exec(`
				INSERT INTO accounting_transaction_lines 
				(transaction_id, account_id, debit_amount, credit_amount, description)
				VALUES ($1, $2, $3, $4, $5)
			`, txnID, line.AccountID, line.DebitAmount, line.CreditAmount, line.Description)
			if err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		h.logger.Error("Failed to create transaction", zap.Error(err))
		sdk.WriteInternalError(w, "Failed to create transaction")
		return
	}

	sdk.WriteCreated(w, map[string]interface{}{
		"transaction_number": transactionNumber,
		"message":            "Transaction created successfully",
	})
}

// GetJournalEntries retrieves journal entries
func (h *AccountingHandler) GetJournalEntries(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	limit := r.URL.Query().Get("limit")

	if limit == "" {
		limit = "50"
	}

	qb := sdk.NewQueryBuilder("SELECT * FROM accounting_journal_entries WHERE 1=1")
	qb.AddOptionalCondition("status = $%d", status)

	query, args := qb.Build()
	query += " ORDER BY entry_date DESC LIMIT " + limit

	var entries []JournalEntry
	if err := h.db.Select(&entries, query, args...); err != nil {
		h.logger.Error("Failed to fetch journal entries", zap.Error(err))
		sdk.WriteInternalError(w, "Failed to fetch journal entries")
		return
	}

	sdk.WriteSuccess(w, map[string]interface{}{
		"entries": entries,
		"count":   len(entries),
	})
}

// CreateJournalEntry creates a new journal entry
func (h *AccountingHandler) CreateJournalEntry(w http.ResponseWriter, r *http.Request) {
	var req struct {
		EntryDate   string             `json:"entry_date"`
		Description *string            `json:"description"`
		Lines       []JournalEntryLine `json:"lines"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sdk.WriteBadRequest(w, "Invalid request body")
		return
	}

	if len(req.Lines) == 0 {
		sdk.WriteBadRequest(w, "At least one line is required")
		return
	}

	// Validate debits equal credits
	var totalDebits, totalCredits float64
	for _, line := range req.Lines {
		totalDebits += line.DebitAmount
		totalCredits += line.CreditAmount
	}

	if totalDebits != totalCredits {
		sdk.WriteBadRequest(w, "Total debits must equal total credits")
		return
	}

	entryNumber := fmt.Sprintf("JE-%d", time.Now().Unix())

	err := sdk.WithTransaction(h.db, func(tx *sqlx.Tx) error {
		var entryID int
		err := tx.QueryRow(`
			INSERT INTO accounting_journal_entries 
			(entry_number, entry_date, description, total_debit, total_credit, created_by)
			VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING id
		`, entryNumber, req.EntryDate, req.Description, totalDebits, totalCredits, 1).Scan(&entryID)
		if err != nil {
			return err
		}

		// Insert lines
		for _, line := range req.Lines {
			_, err = tx.Exec(`
				INSERT INTO accounting_journal_entry_lines 
				(journal_entry_id, account_id, debit_amount, credit_amount, description)
				VALUES ($1, $2, $3, $4, $5)
			`, entryID, line.AccountID, line.DebitAmount, line.CreditAmount, line.Description)
			if err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		h.logger.Error("Failed to create journal entry", zap.Error(err))
		sdk.WriteInternalError(w, "Failed to create journal entry")
		return
	}

	sdk.WriteCreated(w, map[string]interface{}{
		"entry_number": entryNumber,
		"message":      "Journal entry created successfully",
	})
}

// GetBalanceSheet generates a balance sheet report
func (h *AccountingHandler) GetBalanceSheet(w http.ResponseWriter, r *http.Request) {
	asOfDate := r.URL.Query().Get("as_of_date")
	if asOfDate == "" {
		asOfDate = time.Now().Format("2006-01-02")
	}

	query := `
		SELECT 
			coa.account_type,
			coa.account_code,
			coa.account_name,
			COALESCE(SUM(
				CASE 
					WHEN coa.account_type IN ('asset', 'expense') THEN atl.debit_amount - atl.credit_amount
					ELSE atl.credit_amount - atl.debit_amount
				END
			), 0) as balance
		FROM chart_of_accounts coa
		LEFT JOIN accounting_transaction_lines atl ON coa.id = atl.account_id
		LEFT JOIN accounting_transactions at ON atl.transaction_id = at.id
		WHERE coa.is_active = true 
		  AND coa.account_type IN ('asset', 'liability', 'equity')
		  AND (at.transaction_date IS NULL OR at.transaction_date <= $1)
		  AND (at.status IS NULL OR at.status = 'posted')
		GROUP BY coa.account_type, coa.account_code, coa.account_name
		ORDER BY coa.account_type, coa.account_code
	`

	rows, err := h.db.Query(query, asOfDate)
	if err != nil {
		h.logger.Error("Failed to generate balance sheet", zap.Error(err))
		sdk.WriteInternalError(w, "Failed to generate balance sheet")
		return
	}
	defer rows.Close()

	var balanceSheet struct {
		Assets           []AccountBalance `json:"assets"`
		Liabilities      []AccountBalance `json:"liabilities"`
		Equity           []AccountBalance `json:"equity"`
		TotalAssets      float64          `json:"total_assets"`
		TotalLiabilities float64          `json:"total_liabilities"`
		TotalEquity      float64          `json:"total_equity"`
	}

	for rows.Next() {
		var accountType, accountCode, accountName string
		var balance float64

		err := rows.Scan(&accountType, &accountCode, &accountName, &balance)
		if err != nil {
			continue
		}

		accountBalance := AccountBalance{
			AccountCode: accountCode,
			AccountName: accountName,
			Balance:     balance,
		}

		switch accountType {
		case "asset":
			balanceSheet.Assets = append(balanceSheet.Assets, accountBalance)
			balanceSheet.TotalAssets += balance
		case "liability":
			balanceSheet.Liabilities = append(balanceSheet.Liabilities, accountBalance)
			balanceSheet.TotalLiabilities += balance
		case "equity":
			balanceSheet.Equity = append(balanceSheet.Equity, accountBalance)
			balanceSheet.TotalEquity += balance
		}
	}

	sdk.WriteSuccess(w, balanceSheet)
}

// GetIncomeStatement generates an income statement report
func (h *AccountingHandler) GetIncomeStatement(w http.ResponseWriter, r *http.Request) {
	startDate := r.URL.Query().Get("start_date")
	endDate := r.URL.Query().Get("end_date")

	if startDate == "" || endDate == "" {
		sdk.WriteBadRequest(w, "Start date and end date are required")
		return
	}

	query := `
		SELECT 
			coa.account_type,
			coa.account_code,
			coa.account_name,
			COALESCE(SUM(
				CASE 
					WHEN coa.account_type = 'revenue' THEN atl.credit_amount - atl.debit_amount
					WHEN coa.account_type = 'expense' THEN atl.debit_amount - atl.credit_amount
					ELSE 0
				END
			), 0) as amount
		FROM chart_of_accounts coa
		LEFT JOIN accounting_transaction_lines atl ON coa.id = atl.account_id
		LEFT JOIN accounting_transactions at ON atl.transaction_id = at.id
		WHERE coa.is_active = true 
		  AND coa.account_type IN ('revenue', 'expense')
		  AND at.transaction_date BETWEEN $1 AND $2
		  AND at.status = 'posted'
		GROUP BY coa.account_type, coa.account_code, coa.account_name
		ORDER BY coa.account_type, coa.account_code
	`

	rows, err := h.db.Query(query, startDate, endDate)
	if err != nil {
		h.logger.Error("Failed to generate income statement", zap.Error(err))
		sdk.WriteInternalError(w, "Failed to generate income statement")
		return
	}
	defer rows.Close()

	var incomeStatement struct {
		Revenues      []AccountAmount `json:"revenues"`
		Expenses      []AccountAmount `json:"expenses"`
		TotalRevenue  float64         `json:"total_revenue"`
		TotalExpenses float64         `json:"total_expenses"`
		NetIncome     float64         `json:"net_income"`
	}

	for rows.Next() {
		var accountType, accountCode, accountName string
		var amount float64

		err := rows.Scan(&accountType, &accountCode, &accountName, &amount)
		if err != nil {
			continue
		}

		accountAmount := AccountAmount{
			AccountCode: accountCode,
			AccountName: accountName,
			Amount:      amount,
		}

		switch accountType {
		case "revenue":
			incomeStatement.Revenues = append(incomeStatement.Revenues, accountAmount)
			incomeStatement.TotalRevenue += amount
		case "expense":
			incomeStatement.Expenses = append(incomeStatement.Expenses, accountAmount)
			incomeStatement.TotalExpenses += amount
		}
	}

	incomeStatement.NetIncome = incomeStatement.TotalRevenue - incomeStatement.TotalExpenses

	sdk.WriteSuccess(w, incomeStatement)
}

// GetAnalytics retrieves aggregated analytics data for the accounting dashboard
func (h *AccountingHandler) GetAnalytics(w http.ResponseWriter, r *http.Request) {
	// Get totals for assets, liabilities, equity
	var totalAssets, totalLiabilities, totalEquity float64
	var totalRevenue, totalExpenses, netIncome float64
	var grossProfit, operatingProfit float64
	var currentRatio, quickRatio, debtToEquity float64
	var returnOnEquity float64

	// Assets
	h.db.Get(&totalAssets, `
		SELECT COALESCE(SUM(
			CASE 
				WHEN coa.account_type = 'asset' THEN atl.debit_amount - atl.credit_amount
				ELSE 0
			END
		), 0) as balance
		FROM chart_of_accounts coa
		LEFT JOIN accounting_transaction_lines atl ON coa.id = atl.account_id
		LEFT JOIN accounting_transactions at ON atl.transaction_id = at.id
		WHERE coa.is_active = true AND coa.account_type = 'asset'
	`)

	// Liabilities
	h.db.Get(&totalLiabilities, `
		SELECT COALESCE(SUM(
			CASE 
				WHEN coa.account_type = 'liability' THEN atl.credit_amount - atl.debit_amount
				ELSE 0
			END
		), 0) as balance
		FROM chart_of_accounts coa
		LEFT JOIN accounting_transaction_lines atl ON coa.id = atl.account_id
		LEFT JOIN accounting_transactions at ON atl.transaction_id = at.id
		WHERE coa.is_active = true AND coa.account_type = 'liability'
	`)

	// Equity
	h.db.Get(&totalEquity, `
		SELECT COALESCE(SUM(
			CASE 
				WHEN coa.account_type = 'equity' THEN atl.credit_amount - atl.debit_amount
				ELSE 0
			END
		), 0) as balance
		FROM chart_of_accounts coa
		LEFT JOIN accounting_transaction_lines atl ON coa.id = atl.account_id
		LEFT JOIN accounting_transactions at ON atl.transaction_id = at.id
		WHERE coa.is_active = true AND coa.account_type = 'equity'
	`)

	// Revenue
	h.db.Get(&totalRevenue, `
		SELECT COALESCE(SUM(atl.credit_amount - atl.debit_amount), 0) as amount
		FROM chart_of_accounts coa
		JOIN accounting_transaction_lines atl ON coa.id = atl.account_id
		JOIN accounting_transactions at ON atl.transaction_id = at.id
		WHERE coa.is_active = true AND coa.account_type = 'revenue' AND at.status = 'posted'
	`)

	// Expenses
	h.db.Get(&totalExpenses, `
		SELECT COALESCE(SUM(atl.debit_amount - atl.credit_amount), 0) as amount
		FROM chart_of_accounts coa
		JOIN accounting_transaction_lines atl ON coa.id = atl.account_id
		JOIN accounting_transactions at ON atl.transaction_id = at.id
		WHERE coa.is_active = true AND coa.account_type = 'expense' AND at.status = 'posted'
	`)

	netIncome = totalRevenue - totalExpenses
	grossProfit = totalRevenue
	operatingProfit = netIncome

	// Calculate ratios (simplified for demo)
	if totalLiabilities != 0 {
		currentRatio = totalAssets / totalLiabilities
		quickRatio = totalAssets / totalLiabilities
		debtToEquity = totalLiabilities / totalEquity
	}

	if totalEquity != 0 {
		returnOnEquity = netIncome / totalEquity
	}

	analytics := map[string]interface{}{
		"total_assets":         totalAssets,
		"total_liabilities":    totalLiabilities,
		"total_equity":         totalEquity,
		"total_revenue":        totalRevenue,
		"total_expenses":       totalExpenses,
		"net_income":           netIncome,
		"gross_profit":         grossProfit,
		"operating_profit":     operatingProfit,
		"current_ratio":        currentRatio,
		"quick_ratio":          quickRatio,
		"debt_to_equity_ratio": debtToEquity,
		"return_on_equity":     returnOnEquity,
	}

	sdk.WriteSuccess(w, analytics)
}
