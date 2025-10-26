import React from 'react'
import { 
  Calculator, TrendingUp, TrendingDown, DollarSign, Target,
  Receipt, FileText, CreditCard, Percent, Calendar, CheckSquare,
  BarChart3
} from 'lucide-react'
import { ModuleDashboard, useModuleQuery } from '@erp-modules/shared'
import { OverviewTab } from './tabs/OverviewTab'
import { AccountsTab } from './tabs/AccountsTab'
import { TransactionsTab } from './tabs/TransactionsTab'
import { InvoicesTab } from './tabs/InvoicesTab'
import { PaymentsTab } from './tabs/PaymentsTab'
import { BudgetsTab } from './tabs/BudgetsTab'
import { ReportsTab } from './tabs/ReportsTab'
import { TaxCodesTab } from './tabs/TaxCodesTab'
import { FiscalPeriodsTab } from './tabs/FiscalPeriodsTab'
import { ReconciliationsTab } from './tabs/ReconciliationsTab'

interface AccountingAnalytics {
  total_assets: number
  total_liabilities: number
  total_equity: number
  total_revenue: number
  total_expenses: number
  net_income: number
  gross_profit: number
  operating_profit: number
  current_ratio: number
  quick_ratio: number
  debt_to_equity_ratio: number
  return_on_assets: number
  return_on_equity: number
}

export default function AccountingDashboard() {
  const { data: analytics } = useModuleQuery<{ data: AccountingAnalytics }>(
    ['accounting-analytics'],
    '/api/v1/accounting/analytics'
  )

  const analyticsData = analytics?.data

  return (
    <ModuleDashboard
      title="Accounting"
      icon={Calculator}
      description="Complete accounting system with general ledger, AP/AR, and financial reporting"
      kpis={[
        {
          id: 'assets',
          label: 'Total Assets',
          value: `$${analyticsData?.total_assets?.toLocaleString() || 0}`,
          icon: TrendingUp,
          color: 'green',
        },
        {
          id: 'liabilities',
          label: 'Total Liabilities',
          value: `$${analyticsData?.total_liabilities?.toLocaleString() || 0}`,
          icon: TrendingDown,
          color: 'red',
        },
        {
          id: 'revenue',
          label: 'Total Revenue',
          value: `$${analyticsData?.total_revenue?.toLocaleString() || 0}`,
          icon: DollarSign,
          color: 'blue',
        },
        {
          id: 'net-income',
          label: 'Net Income',
          value: `$${analyticsData?.net_income?.toLocaleString() || 0}`,
          icon: Target,
          color: 'purple',
        },
      ]}
      actions={[
        {
          id: 'new-transaction',
          label: 'New Transaction',
          icon: Receipt,
          onClick: () => {},
          variant: 'secondary',
        },
        {
          id: 'new-account',
          label: 'New Account',
          icon: Calculator,
          onClick: () => {},
          variant: 'primary',
        },
      ]}
      tabs={[
        {
          id: 'overview',
          label: 'Overview',
          icon: BarChart3,
          content: <OverviewTab analytics={analyticsData} />,
        },
        {
          id: 'accounts',
          label: 'Chart of Accounts',
          icon: Calculator,
          content: <AccountsTab />,
        },
        {
          id: 'transactions',
          label: 'Transactions',
          icon: Receipt,
          content: <TransactionsTab />,
        },
        {
          id: 'invoices',
          label: 'Invoices',
          icon: FileText,
          content: <InvoicesTab />,
        },
        {
          id: 'payments',
          label: 'Payments',
          icon: CreditCard,
          content: <PaymentsTab />,
        },
        {
          id: 'budgets',
          label: 'Budgets',
          icon: Target,
          content: <BudgetsTab />,
        },
        {
          id: 'reports',
          label: 'Reports',
          icon: FileText,
          content: <ReportsTab />,
        },
        {
          id: 'tax-codes',
          label: 'Tax Codes',
          icon: Percent,
          content: <TaxCodesTab />,
        },
        {
          id: 'fiscal-periods',
          label: 'Fiscal Periods',
          icon: Calendar,
          content: <FiscalPeriodsTab />,
        },
        {
          id: 'reconciliations',
          label: 'Reconciliations',
          icon: CheckSquare,
          content: <ReconciliationsTab />,
        },
      ]}
      defaultTab="overview"
    />
  )
}
