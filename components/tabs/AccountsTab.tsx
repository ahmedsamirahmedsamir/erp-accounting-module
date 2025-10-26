import React, { useState } from 'react'
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react'
import { useModuleQuery, useDeleteMutation } from '@erp-modules/shared'
import { DataTable } from '@erp-modules/shared'
import type { ColumnDef } from '@tanstack/react-table'

interface ChartOfAccount {
  id: string
  account_code: string
  account_name: string
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  parent_account_name?: string
  is_active: boolean
  description: string
  balance: number
  created_at: string
}

export function AccountsTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAccountType, setSelectedAccountType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  const { data, isLoading } = useModuleQuery<{ data: { accounts: ChartOfAccount[] } }>(
    ['chart-of-accounts', searchQuery, selectedAccountType, selectedStatus],
    `/api/v1/accounting/accounts?search=${searchQuery}&type=${selectedAccountType}&is_active=${selectedStatus}`
  )

  const deleteAccount = useDeleteMutation('/api/v1/accounting/accounts', ['chart-of-accounts'])

  const getAccountTypeColor = (type: string) => {
    const colors = {
      asset: 'bg-green-100 text-green-800',
      liability: 'bg-red-100 text-red-800',
      equity: 'bg-blue-100 text-blue-800',
      revenue: 'bg-green-100 text-green-800',
      expense: 'bg-red-100 text-red-800',
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const columns: ColumnDef<ChartOfAccount>[] = [
    {
      accessorKey: 'account_code',
      header: 'Account Code',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.account_code}</div>
          <div className="text-sm text-gray-500">{row.original.account_name}</div>
        </div>
      ),
    },
    {
      accessorKey: 'account_type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('account_type') as string
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
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">
          {row.getValue('parent_account_name') || 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: ({ row }) => {
        const balance = row.getValue('balance') as number
        return (
          <span className="font-medium text-gray-900">
            ${balance?.toFixed(2) || '0.00'}
          </span>
        )
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('is_active') as boolean
        return (
          <span className={`px-2 py-1 text-xs rounded ${
            isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <button
            className="p-1 text-blue-600 hover:text-blue-800"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            className="p-1 text-green-600 hover:text-green-800"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this account?')) {
                deleteAccount.mutate(row.original.id)
              }
            }}
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
      <DataTable
        data={data?.data?.accounts || []}
        columns={columns}
        enablePagination
        enableSorting
        enableFiltering
        enableExport
        isLoading={isLoading}
      />
    </div>
  )
}

