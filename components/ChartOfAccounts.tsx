import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Filter, Calculator, Edit, Trash2, Eye, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { DataTable } from '../../components/table/DataTable'
import { api } from '../../lib/api'

interface ChartOfAccount {
  id: string
  account_code: string
  account_name: string
  account_type: string
  parent_account_id: string
  is_active: boolean
  description: string
  created_at: string
  updated_at: string
}

interface ChartOfAccountsResponse {
  success: boolean
  data: {
    accounts: ChartOfAccount[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export function ChartOfAccounts() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const queryClient = useQueryClient()

  // Fetch chart of accounts
  const { data: accountsData, isLoading } = useQuery({
    queryKey: ['chart-of-accounts', currentPage, searchQuery, selectedType, selectedStatus],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      })
      if (searchQuery) params.append('search', searchQuery)
      if (selectedType) params.append('account_type', selectedType)
      if (selectedStatus) params.append('is_active', selectedStatus)
      
      const response = await api.get(`/accounting/accounts?${params}`)
      return response.data as ChartOfAccountsResponse
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

  const handleDelete = (accountId: string) => {
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

  const columns = [
    {
      accessorKey: 'account_code',
      header: 'Account Code',
      cell: ({ row }: any) => (
        <div className="flex items-center">
          {getAccountTypeIcon(row.getValue('account_type'))}
          <div className="ml-2">
            <div className="font-medium text-gray-900">{row.getValue('account_code')}</div>
            <div className="text-sm text-gray-500">{row.getValue('account_name')}</div>
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
      accessorKey: 'parent_account_id',
      header: 'Parent Account',
      cell: ({ row }: any) => (
        <span className="text-sm text-gray-500">
          {row.getValue('parent_account_id') || 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }: any) => {
        const isActive = row.getValue('is_active')
        return (
          <span className={`px-2 py-1 text-xs rounded ${
            isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
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
            onClick={() => {/* Navigate to account detail */}}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => {/* Navigate to edit account */}}
            className="p-1 text-green-600 hover:text-green-800"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            className="p-1 text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  const accounts = accountsData?.data.accounts || []
  const pagination = accountsData?.data.pagination

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Calculator className="h-6 w-6 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Chart of Accounts</h1>
        </div>
        <button
          onClick={() => {/* Navigate to new account */}}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Account
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {/* Search */}
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

          {/* Account Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="asset">Asset</option>
            <option value="liability">Liability</option>
            <option value="equity">Equity</option>
            <option value="revenue">Revenue</option>
            <option value="expense">Expense</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedType('')
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
          columns={columns}
          isLoading={isLoading}
        />
        
        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm font-medium text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
