import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Plus, Search, Filter, Calculator, Edit, Trash2, Eye, BarChart3, 
  TrendingUp, TrendingDown, Calendar, AlertTriangle, CheckCircle, 
  Clock, Download, Upload, Settings, Zap, Bell, Globe, 
  FileText, PieChart, LineChart, Activity, Target, 
  RefreshCw, Play, Pause, MoreHorizontal, Star, DollarSign, X,
  CreditCard, Receipt, Users, Phone, Mail, MapPin, Building, Home,
  Briefcase, Handshake, Clipboard, CheckSquare, Square, FileSpreadsheet,
  FileImage, FileVideo, FileAudio, Smartphone, Monitor, Tablet, Laptop,
  Headphones, Camera, Mic, Speaker, Printer, Scanner, Fax, Wifi,
  WifiOff, Signal, Battery, Thermometer, Droplets, Sun, Moon, Wind,
  Snowflake, ArrowUpRight, ArrowDownRight, ArrowRight, ArrowLeft,
  Percent, Hash, Tag, Barcode, ScanLine, Database, Cloud, MessageSquare,
  Send, Calendar as CalendarIcon, Clock as ClockIcon, CheckCircle as CheckCircleIcon,
  AlertCircle, Layers, RotateCcw, Archive, CheckSquare as CheckSquareIcon2,
  ArrowUpDown, ArrowDownRight as ArrowDownRightIcon, ArrowRightLeft,
  ArrowLeftRight, FileSpreadsheet as FileSpreadsheetIcon, FileImage as FileImageIcon,
  FileVideo as FileVideoIcon, FileAudio as FileAudioIcon, Smartphone as SmartphoneIcon,
  Monitor as MonitorIcon, Tablet as TabletIcon, Laptop as LaptopIcon,
  Headphones as HeadphonesIcon, Camera as CameraIcon, Mic as MicIcon,
  Speaker as SpeakerIcon, Printer as PrinterIcon, Scanner as ScannerIcon,
  Fax as FaxIcon, Wifi as WifiIcon, WifiOff as WifiOffIcon, Signal as SignalIcon,
  Battery as BatteryIcon, Thermometer as ThermometerIcon, Droplets as DropletsIcon,
  Sun as SunIcon, Moon as MoonIcon, Wind as WindIcon, Snowflake as SnowflakeIcon,
  Banknote, Wallet, PiggyBank, Coins, CreditCard as CreditCardIcon,
  Receipt as ReceiptIcon, FileText as FileTextIcon, BookOpen, Scale,
  Shield, Lock, Unlock, Key, Fingerprint, UserCheck, UserX, UserPlus,
  UserMinus, Award, Gift, Package, Truck, Plane, Ship, Building as BuildingIcon,
  Home as HomeIcon, Briefcase as BriefcaseIcon, Handshake as HandshakeIcon,
  Clipboard as ClipboardIcon, CheckSquare as CheckSquareIcon3, Square as SquareIcon
} from 'lucide-react'
import { DataTable } from '../../components/table/DataTable'
import { api } from '../../lib/api'

interface ChartOfAccount {
  id: string
  account_code: string
  account_name: string
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  parent_account_id?: string
  parent_account_name?: string
  is_active: boolean
  description: string
  balance: number
  debit_balance: number
  credit_balance: number
  created_at: string
  updated_at: string
}

interface AccountingTransaction {
  id: string
  transaction_number: string
  transaction_date: string
  description: string
  reference: string
  total_amount: number
  status: 'draft' | 'posted' | 'reversed'
  created_by: string
  created_by_name: string
  posted_by?: string
  posted_by_name?: string
  posted_at?: string
  journal_entries: JournalEntry[]
  attachments: string[]
  created_at: string
  updated_at: string
}

interface JournalEntry {
  id: string
  account_id: string
  account_code: string
  account_name: string
  debit_amount: number
  credit_amount: number
  description: string
  reference: string
}

interface AccountingInvoice {
  id: string
  invoice_number: string
  customer_id: string
  customer_name: string
  invoice_date: string
  due_date: string
  total_amount: number
  paid_amount: number
  balance_amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  payment_terms: string
  notes: string
  line_items: InvoiceLineItem[]
  created_at: string
  updated_at: string
}

interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total_amount: number
  tax_rate: number
  tax_amount: number
}

interface AccountingPayment {
  id: string
  payment_number: string
  customer_id: string
  customer_name: string
  invoice_id?: string
  invoice_number?: string
  payment_date: string
  amount: number
  payment_method: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'paypal'
  reference_number: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  notes: string
  created_at: string
  updated_at: string
}

interface AccountingBudget {
  id: string
  budget_name: string
  fiscal_year: number
  fiscal_period: string
  account_id: string
  account_code: string
  account_name: string
  budgeted_amount: number
  actual_amount: number
  variance_amount: number
  variance_percentage: number
  status: 'draft' | 'approved' | 'active' | 'closed'
  created_at: string
  updated_at: string
}

interface AccountingReport {
  id: string
  report_name: string
  report_type: 'balance_sheet' | 'income_statement' | 'cash_flow' | 'trial_balance' | 'general_ledger'
  parameters: string
  generated_at: string
  generated_by: string
  file_url: string
  status: 'generating' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

interface TaxCode {
  id: string
  code: string
  name: string
  rate: number
  type: 'sales_tax' | 'income_tax' | 'payroll_tax' | 'property_tax'
  is_active: boolean
  effective_from: string
  effective_to?: string
  description: string
  created_at: string
  updated_at: string
}

interface FiscalPeriod {
  id: string
  period_name: string
  fiscal_year: number
  start_date: string
  end_date: string
  status: 'open' | 'closed' | 'locked'
  is_current: boolean
  created_at: string
  updated_at: string
}

interface Reconciliation {
  id: string
  account_id: string
  account_code: string
  account_name: string
  statement_date: string
  statement_balance: number
  book_balance: number
  reconciled_balance: number
  status: 'pending' | 'in_progress' | 'completed' | 'discrepancy'
  created_by: string
  created_by_name: string
  completed_by?: string
  completed_by_name?: string
  completed_at?: string
  notes: string
  created_at: string
  updated_at: string
}

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
  monthly_trends: Array<{
    month: string
    revenue: number
    expenses: number
    net_income: number
    assets: number
    liabilities: number
  }>
  account_balances: Array<{
    account_code: string
    account_name: string
    balance: number
    account_type: string
  }>
  top_expenses: Array<{
    account_code: string
    account_name: string
    amount: number
    percentage: number
  }>
  cash_flow: Array<{
    period: string
    operating_cash_flow: number
    investing_cash_flow: number
    financing_cash_flow: number
    net_cash_flow: number
  }>
}

export function AdvancedAccountingManagement() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAccountType, setSelectedAccountType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [showReportGenerator, setShowReportGenerator] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<ChartOfAccount | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const queryClient = useQueryClient()

  // Fetch accounting analytics
  const { data: analyticsData } = useQuery({
    queryKey: ['accounting-analytics'],
    queryFn: async () => {
      const response = await api.get('/accounting/analytics')
      return response.data.data as AccountingAnalytics
    },
  })

  // Fetch chart of accounts
  const { data: accountsData, isLoading } = useQuery({
    queryKey: ['chart-of-accounts', currentPage, searchQuery, selectedAccountType, selectedStatus],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      })
      if (searchQuery) params.append('search', searchQuery)
      if (selectedAccountType) params.append('account_type', selectedAccountType)
      if (selectedStatus) params.append('is_active', selectedStatus)
      
      const response = await api.get(`/accounting/accounts?${params}`)
      return response.data
    },
  })

  // Fetch transactions
  const { data: transactionsData } = useQuery({
    queryKey: ['accounting-transactions'],
    queryFn: async () => {
      const response = await api.get('/accounting/transactions')
      return response.data.data as AccountingTransaction[]
    },
  })

  // Fetch invoices
  const { data: invoicesData } = useQuery({
    queryKey: ['accounting-invoices'],
    queryFn: async () => {
      const response = await api.get('/accounting/invoices')
      return response.data.data as AccountingInvoice[]
    },
  })

  // Fetch payments
  const { data: paymentsData } = useQuery({
    queryKey: ['accounting-payments'],
    queryFn: async () => {
      const response = await api.get('/accounting/payments')
      return response.data.data as AccountingPayment[]
    },
  })

  // Fetch budgets
  const { data: budgetsData } = useQuery({
    queryKey: ['accounting-budgets'],
    queryFn: async () => {
      const response = await api.get('/accounting/budgets')
      return response.data.data as AccountingBudget[]
    },
  })

  // Fetch reports
  const { data: reportsData } = useQuery({
    queryKey: ['accounting-reports'],
    queryFn: async () => {
      const response = await api.get('/accounting/reports')
      return response.data.data as AccountingReport[]
    },
  })

  // Fetch tax codes
  const { data: taxCodesData } = useQuery({
    queryKey: ['tax-codes'],
    queryFn: async () => {
      const response = await api.get('/accounting/tax-codes')
      return response.data.data as TaxCode[]
    },
  })

  // Fetch fiscal periods
  const { data: fiscalPeriodsData } = useQuery({
    queryKey: ['fiscal-periods'],
    queryFn: async () => {
      const response = await api.get('/accounting/fiscal-periods')
      return response.data.data as FiscalPeriod[]
    },
  })

  // Fetch reconciliations
  const { data: reconciliationsData } = useQuery({
    queryKey: ['reconciliations'],
    queryFn: async () => {
      const response = await api.get('/accounting/reconciliations')
      return response.data.data as Reconciliation[]
    },
  })

  // Create account mutation
  const createAccount = useMutation({
    mutationFn: async (accountData: Partial<ChartOfAccount>) => {
      const response = await api.post('/accounting/accounts', accountData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chart-of-accounts'] })
      setShowAccountForm(false)
    },
  })

  // Update account mutation
  const updateAccount = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ChartOfAccount> }) => {
      const response = await api.put(`/accounting/accounts/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chart-of-accounts'] })
    },
  })

  // Delete account mutation
  const deleteAccount = useMutation({
    mutationFn: async (accountId: string) => {
      await api.delete(`/accounting/accounts/${accountId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chart-of-accounts'] })
    },
  })

  // Create transaction mutation
  const createTransaction = useMutation({
    mutationFn: async (transactionData: Partial<AccountingTransaction>) => {
      const response = await api.post('/accounting/transactions', transactionData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting-transactions'] })
      setShowTransactionForm(false)
    },
  })

  // Create invoice mutation
  const createInvoice = useMutation({
    mutationFn: async (invoiceData: Partial<AccountingInvoice>) => {
      const response = await api.post('/accounting/invoices', invoiceData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting-invoices'] })
      setShowInvoiceForm(false)
    },
  })

  // Create payment mutation
  const createPayment = useMutation({
    mutationFn: async (paymentData: Partial<AccountingPayment>) => {
      const response = await api.post('/accounting/payments', paymentData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting-payments'] })
      setShowPaymentForm(false)
    },
  })

  // Create budget mutation
  const createBudget = useMutation({
    mutationFn: async (budgetData: Partial<AccountingBudget>) => {
      const response = await api.post('/accounting/budgets', budgetData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting-budgets'] })
      setShowBudgetForm(false)
    },
  })

  // Generate report mutation
  const generateReport = useMutation({
    mutationFn: async (reportData: any) => {
      const response = await api.post('/accounting/reports/generate', reportData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting-reports'] })
      setShowReportGenerator(false)
    },
  })

  const handleDeleteAccount = (accountId: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      deleteAccount.mutate(accountId)
    }
  }

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'asset':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'liability':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'equity':
        return <DollarSign className="h-4 w-4 text-blue-600" />
      case 'revenue':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'expense':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Calculator className="h-4 w-4 text-gray-600" />
    }
  }

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'asset':
        return 'bg-green-100 text-green-800'
      case 'liability':
        return 'bg-red-100 text-red-800'
      case 'equity':
        return 'bg-blue-100 text-blue-800'
      case 'revenue':
        return 'bg-green-100 text-green-800'
      case 'expense':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'draft': 'bg-yellow-100 text-yellow-800',
      'posted': 'bg-green-100 text-green-800',
      'reversed': 'bg-red-100 text-red-800',
      'sent': 'bg-blue-100 text-blue-800',
      'paid': 'bg-green-100 text-green-800',
      'overdue': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'refunded': 'bg-orange-100 text-orange-800',
      'approved': 'bg-green-100 text-green-800',
      'closed': 'bg-gray-100 text-gray-800',
      'generating': 'bg-yellow-100 text-yellow-800',
      'open': 'bg-green-100 text-green-800',
      'locked': 'bg-red-100 text-red-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'discrepancy': 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const accounts = accountsData?.data?.accounts || []
  const transactions = transactionsData || []
  const invoices = invoicesData || []
  const payments = paymentsData || []
  const budgets = budgetsData || []
  const reports = reportsData || []
  const taxCodes = taxCodesData || []
  const fiscalPeriods = fiscalPeriodsData || []
  const reconciliations = reconciliationsData || []
  const analytics = analyticsData

  const accountColumns = [
    {
      accessorKey: 'account_code',
      header: 'Account Code',
      cell: ({ row }: any) => (
        <div className="flex items-center">
          {getAccountTypeIcon(row.getValue('account_type'))}
          <div className="ml-2">
            <div className="font-medium text-gray-900">{row.getValue('account_code')}</div>
            <div className="text-sm text-gray-500">{row.original.account_name}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'account_type',
      header: 'Type',
      cell: ({ row }: any) => {
        const type = row.getValue('account_type')
        return (
          <span className={`px-2 py-1 text-xs rounded ${getAccountTypeColor(type)}`}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        )
      },
    },
    {
      accessorKey: 'parent_account_name',
      header: 'Parent Account',
      cell: ({ row }: any) => (
        <span className="text-sm text-gray-500">
          {row.getValue('parent_account_name') || 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: ({ row }: any) => {
        const balance = row.getValue('balance')
        const type = row.original.account_type
        const isDebit = type === 'asset' || type === 'expense'
        const isCredit = type === 'liability' || type === 'equity' || type === 'revenue'
        
        return (
          <span className={`font-medium ${
            isDebit ? 'text-green-600' : isCredit ? 'text-red-600' : 'text-gray-900'
          }`}>
            ${balance?.toFixed(2) || '0.00'}
          </span>
        )
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }: any) => {
        const isActive = row.getValue('is_active')
        return (
          <span className={`px-2 py-1 text-xs rounded ${getStatusColor(isActive ? 'active' : 'inactive')}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        )
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }: any) => (
        <span className="text-sm text-gray-500">
          {row.getValue('description') || 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }: any) => (
        <span className="text-sm text-gray-500">
          {new Date(row.getValue('created_at')).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedAccount(row.original)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSelectedAccount(row.original)}
            className="p-1 text-green-600 hover:text-green-800"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteAccount(row.original.id)}
            className="p-1 text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Calculator className="h-6 w-6 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Advanced Accounting Management</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowReportGenerator(true)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </button>
          <button
            onClick={() => setShowBudgetForm(true)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Target className="h-4 w-4 mr-2" />
            New Budget
          </button>
          <button
            onClick={() => setShowTransactionForm(true)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Receipt className="h-4 w-4 mr-2" />
            New Transaction
          </button>
          <button
            onClick={() => setShowAccountForm(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Assets</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${analytics?.total_assets?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Liabilities</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${analytics?.total_liabilities?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${analytics?.total_revenue?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Net Income</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${analytics?.net_income?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Current Ratio</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics?.current_ratio?.toFixed(2) || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">ROA</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics?.return_on_assets?.toFixed(2) || 0}%
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">ROE</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics?.return_on_equity?.toFixed(2) || 0}%
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Scale className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Debt/Equity</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics?.debt_to_equity_ratio?.toFixed(2) || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'accounts', label: 'Chart of Accounts', icon: Calculator },
            { id: 'transactions', label: 'Transactions', icon: Receipt },
            { id: 'invoices', label: 'Invoices', icon: FileText },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'budgets', label: 'Budgets', icon: Target },
            { id: 'reports', label: 'Reports', icon: FileText },
            { id: 'tax-codes', label: 'Tax Codes', icon: Percent },
            { id: 'fiscal-periods', label: 'Fiscal Periods', icon: Calendar },
            { id: 'reconciliations', label: 'Reconciliations', icon: CheckSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Monthly Trends Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Financial Trends</h3>
            <div className="h-64 flex items-end space-x-2">
              {analytics?.monthly_trends?.slice(0, 12).map((trend, index) => (
                <div key={trend.month} className="flex-1 flex flex-col items-center">
                  <div 
                    className="bg-blue-500 rounded-t w-full mb-2"
                    style={{ height: `${(trend.revenue / Math.max(...analytics.monthly_trends.map(t => t.revenue))) * 200}px` }}
                  />
                  <div className="text-xs text-gray-500 text-center">
                    {new Date(trend.month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                  <div className="text-xs text-gray-400">
                    ${(trend.revenue / 1000).toFixed(0)}k
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Balances */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Balances</h3>
            <div className="space-y-3">
              {analytics?.account_balances?.slice(0, 10).map((account, index) => (
                <div key={account.account_code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-2">#{index + 1}</span>
                    <span className="text-sm text-gray-700">{account.account_name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      ${account.balance.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {account.account_code} • {account.account_type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Expenses */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Expenses</h3>
            <div className="space-y-3">
              {analytics?.top_expenses?.slice(0, 5).map((expense, index) => (
                <div key={expense.account_code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-2">#{index + 1}</span>
                    <span className="text-sm text-gray-700">{expense.account_name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      ${expense.amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {expense.percentage.toFixed(1)}% of total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chart of Accounts Tab */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={selectedAccountType}
                onChange={(e) => setSelectedAccountType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="asset">Asset</option>
                <option value="liability">Liability</option>
                <option value="equity">Equity</option>
                <option value="revenue">Revenue</option>
                <option value="expense">Expense</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>

              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedAccountType('')
                  setSelectedStatus('')
                }}
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            </div>
          </div>

          {/* Accounts Table */}
          <div className="bg-white rounded-lg shadow">
            <DataTable
              data={accounts}
              columns={accountColumns}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Receipt className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.transaction_number} - {transaction.description}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.reference} • {new Date(transaction.transaction_date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        Created by: {transaction.created_by_name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                    <span className="font-medium text-gray-900">
                      ${transaction.total_amount.toFixed(2)}
                    </span>
                    <button className="p-1 text-blue-600 hover:text-blue-800">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Accounting Invoices</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {invoices.slice(0, 10).map((invoice) => (
                <div key={invoice.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.invoice_number} - {invoice.customer_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Due: {new Date(invoice.due_date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        Payment Terms: {invoice.payment_terms}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        ${invoice.total_amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Balance: ${invoice.balance_amount.toFixed(2)}
                      </div>
                    </div>
                    <button className="p-1 text-blue-600 hover:text-blue-800">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Accounting Payments</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {payments.slice(0, 10).map((payment) => (
                <div key={payment.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-purple-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {payment.payment_number} - {payment.customer_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.payment_method} • {new Date(payment.payment_date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        Reference: {payment.reference_number}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                    <span className="font-medium text-gray-900">
                      ${payment.amount.toFixed(2)}
                    </span>
                    <button className="p-1 text-blue-600 hover:text-blue-800">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Budgets Tab */}
      {activeTab === 'budgets' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Accounting Budgets</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {budgets.slice(0, 10).map((budget) => (
                <div key={budget.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Target className="h-5 w-5 text-orange-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {budget.budget_name} - {budget.account_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {budget.fiscal_year} • {budget.fiscal_period}
                      </div>
                      <div className="text-xs text-gray-400">
                        Account: {budget.account_code}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(budget.status)}`}>
                      {budget.status}
                    </span>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        ${budget.budgeted_amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Actual: ${budget.actual_amount.toFixed(2)}
                      </div>
                    </div>
                    <button className="p-1 text-blue-600 hover:text-blue-800">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Generated Reports</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {reports.slice(0, 10).map((report) => (
                <div key={report.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {report.report_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {report.report_type.replace('_', ' ').toUpperCase()} • 
                        Generated {new Date(report.generated_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        By: {report.generated_by}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                    <button className="p-1 text-blue-600 hover:text-blue-800">
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-600 hover:text-gray-800">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tax Codes Tab */}
      {activeTab === 'tax-codes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Tax Codes</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {taxCodes.map((taxCode) => (
                <div key={taxCode.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Percent className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {taxCode.code} - {taxCode.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {taxCode.type.replace('_', ' ').toUpperCase()} • 
                        {taxCode.rate.toFixed(2)}%
                      </div>
                      <div className="text-xs text-gray-400">
                        Effective: {new Date(taxCode.effective_from).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      taxCode.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {taxCode.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <button className="p-1 text-blue-600 hover:text-blue-800">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fiscal Periods Tab */}
      {activeTab === 'fiscal-periods' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Fiscal Periods</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {fiscalPeriods.map((period) => (
                <div key={period.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {period.period_name} - {period.fiscal_year}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(period.status)}`}>
                      {period.status}
                    </span>
                    {period.is_current && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        Current
                      </span>
                    )}
                    <button className="p-1 text-blue-600 hover:text-blue-800">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reconciliations Tab */}
      {activeTab === 'reconciliations' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Bank Reconciliations</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {reconciliations.slice(0, 10).map((reconciliation) => (
                <div key={reconciliation.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckSquare className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {reconciliation.account_code} - {reconciliation.account_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Statement Date: {new Date(reconciliation.statement_date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        Created by: {reconciliation.created_by_name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(reconciliation.status)}`}>
                      {reconciliation.status.replace('_', ' ')}
                    </span>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        ${reconciliation.statement_balance.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Book: ${reconciliation.book_balance.toFixed(2)}
                      </div>
                    </div>
                    <button className="p-1 text-blue-600 hover:text-blue-800">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Account Form Modal */}
      {showAccountForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Account</h3>
              <button
                onClick={() => setShowAccountForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Code</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="asset">Asset</option>
                  <option value="liability">Liability</option>
                  <option value="equity">Equity</option>
                  <option value="revenue">Revenue</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowAccountForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => createAccount.mutate({})}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">New Transaction</h3>
              <button
                onClick={() => setShowTransactionForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowTransactionForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => createTransaction.mutate({})}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
              >
                Create Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Generator Modal */}
      {showReportGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Generate Report</h3>
              <button
                onClick={() => setShowReportGenerator(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="balance_sheet">Balance Sheet</option>
                  <option value="income_statement">Income Statement</option>
                  <option value="cash_flow">Cash Flow Statement</option>
                  <option value="trial_balance">Trial Balance</option>
                  <option value="general_ledger">General Ledger</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Name</label>
                <input
                  type="text"
                  placeholder="Enter report name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </form>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowReportGenerator(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => generateReport.mutate({})}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
