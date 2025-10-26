package main

import (
	"fmt"
	"net/http"
	"runtime"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
	sdk "github.com/linearbits/erp-backend/pkg/module-sdk"
	"go.uber.org/zap"
)

// Build-time variables
var (
	Platform  = runtime.GOOS
	Arch      = runtime.GOARCH
	GoVersion = runtime.Version()
	BuildTime = time.Now().Format(time.RFC3339)
)

// Metadata exports build and runtime information
var Metadata = struct {
	GoVersion    string   `json:"go_version"`
	Dependencies []string `json:"dependencies"`
	BuildTime    string   `json:"build_time"`
	Platform     string   `json:"platform"`
	Arch         string   `json:"arch"`
}{
	GoVersion:    GoVersion,
	Dependencies: []string{"github.com/go-chi/chi/v5", "github.com/jmoiron/sqlx", "go.uber.org/zap"},
	BuildTime:    BuildTime,
	Platform:     Platform,
	Arch:         Arch,
}

// AccountingPlugin implements the ModulePlugin interface
type AccountingPlugin struct {
	db      *sqlx.DB
	logger  *zap.Logger
	handler *AccountingHandler
}

// NewAccountingPlugin creates a new plugin instance
func NewAccountingPlugin() sdk.ModulePlugin {
	return &AccountingPlugin{}
}

// Initialize initializes the plugin with database and logger
func (p *AccountingPlugin) Initialize(db *sqlx.DB, logger *zap.Logger) error {
	p.db = db
	p.logger = logger
	p.handler = NewAccountingHandler(db, logger)
	p.logger.Info("Accounting module initialized")
	return nil
}

// GetModuleCode returns the module code
func (p *AccountingPlugin) GetModuleCode() string {
	return "accounting"
}

// GetModuleVersion returns the module version
func (p *AccountingPlugin) GetModuleVersion() string {
	return "1.0.0"
}

// Cleanup performs cleanup when module is unloaded
func (p *AccountingPlugin) Cleanup() error {
	p.logger.Info("Cleaning up accounting module")
	return nil
}

// GetHandler returns a handler function for a given route and method
func (p *AccountingPlugin) GetHandler(route string, method string) (http.HandlerFunc, error) {
	route = strings.TrimPrefix(route, "/")
	method = strings.ToUpper(method)

	// Map routes to handlers
	handlers := p.buildHandlerMap()

	key := method + " " + route
	if handler, ok := handlers[key]; ok {
		return handler, nil
	}

	// Try pattern matching for routes with parameters
	for pattern, handler := range handlers {
		if p.matchRoute(pattern, key) {
			return handler, nil
		}
	}

	return nil, fmt.Errorf("handler not found for route: %s %s", method, route)
}

// buildHandlerMap creates the mapping of routes to handlers
func (p *AccountingPlugin) buildHandlerMap() map[string]http.HandlerFunc {
	return map[string]http.HandlerFunc{
		// Chart of Accounts
		"GET /accounts":         p.handler.GetChartOfAccounts,
		"POST /accounts":        p.handler.CreateChartOfAccount,
		"PUT /accounts/{id}":    p.handler.UpdateChartOfAccount,
		"DELETE /accounts/{id}": p.handler.DeleteChartOfAccount,

		// Transactions
		"GET /transactions":  p.handler.GetAccountingTransactions,
		"POST /transactions": p.handler.CreateAccountingTransaction,

		// Journal Entries
		"GET /journal-entries":  p.handler.GetJournalEntries,
		"POST /journal-entries": p.handler.CreateJournalEntry,

		// Reports
		"GET /reports/balance-sheet":    p.handler.GetBalanceSheet,
		"GET /reports/income-statement": p.handler.GetIncomeStatement,
	}
}

// matchRoute checks if a route pattern matches the actual route
func (p *AccountingPlugin) matchRoute(pattern, actual string) bool {
	// Simple pattern matching for {id} style parameters
	patternParts := strings.Split(pattern, " ")
	actualParts := strings.Split(actual, " ")

	if len(patternParts) != 2 || len(actualParts) != 2 {
		return false
	}

	// Check method
	if patternParts[0] != actualParts[0] {
		return false
	}

	// Check path with parameter matching
	patternPath := strings.Split(patternParts[1], "/")
	actualPath := strings.Split(actualParts[1], "/")

	if len(patternPath) != len(actualPath) {
		return false
	}

	for i := range patternPath {
		if patternPath[i] != actualPath[i] {
			// Check if it's a parameter placeholder
			if !strings.HasPrefix(patternPath[i], "{") || !strings.HasSuffix(patternPath[i], "}") {
				return false
			}
		}
	}

	return true
}

// Handler is the exported symbol that the plugin loader looks for
// It must return a PluginHandler interface that implements our methods
var Handler = NewAccountingPlugin
