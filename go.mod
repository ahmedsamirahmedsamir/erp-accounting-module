module github.com/linearbits/erp-accounting-module

go 1.21

require (
	github.com/go-chi/chi/v5 v5.0.10
	github.com/jmoiron/sqlx v1.3.5
	github.com/linearbits/erp-backend/pkg/module-sdk v0.0.0
	go.uber.org/zap v1.26.0
)

require go.uber.org/multierr v1.11.0 // indirect

// Use local module-sdk during development
replace github.com/linearbits/erp-backend/pkg/module-sdk => ../erp/backend/pkg/module-sdk
