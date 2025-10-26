import React from 'react'
import { BarChart3, TrendingUp, DollarSign } from 'lucide-react'

interface OverviewTabProps {
  analytics?: {
    monthly_trends?: Array<{
      month: string
      revenue: number
      expenses: number
      net_income: number
    }>
    account_balances?: Array<{
      account_code: string
      account_name: string
      balance: number
      account_type: string
    }>
    top_expenses?: Array<{
      account_code: string
      account_name: string
      amount: number
      percentage: number
    }>
  }
}

export function OverviewTab({ analytics }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Monthly Trends Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Monthly Financial Trends
        </h3>
        <div className="h-64 flex items-end space-x-2">
          {analytics?.monthly_trends?.slice(0, 12).map((trend, index) => {
            const maxRevenue = Math.max(...(analytics.monthly_trends?.map(t => t.revenue) || [1]))
            const height = (trend.revenue / maxRevenue) * 200
            return (
              <div key={trend.month} className="flex-1 flex flex-col items-center">
                <div 
                  className="bg-blue-500 rounded-t w-full mb-2"
                  style={{ height: `${height}px` }}
                  title={`Revenue: $${trend.revenue.toLocaleString()}`}
                />
                <div className="text-xs text-gray-500 text-center">
                  {new Date(trend.month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                </div>
                <div className="text-xs text-gray-400">
                  ${(trend.revenue / 1000).toFixed(0)}k
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Account Balances */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Top Account Balances
        </h3>
        <div className="space-y-3">
          {analytics?.account_balances?.slice(0, 10).map((account, index) => (
            <div key={account.account_code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">#{index + 1}</span>
                <div>
                  <div className="text-sm font-medium text-gray-900">{account.account_name}</div>
                  <div className="text-xs text-gray-500">{account.account_code} • {account.account_type}</div>
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                ${account.balance.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Expenses */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Top Expenses
        </h3>
        <div className="space-y-3">
          {analytics?.top_expenses?.slice(0, 5).map((expense, index) => (
            <div key={expense.account_code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">#{index + 1}</span>
                <div>
                  <div className="text-sm font-medium text-gray-900">{expense.account_name}</div>
                  <div className="text-xs text-gray-500">{expense.percentage.toFixed(1)}% of total</div>
                </div>
              </div>
              <div className="text-sm font-semibold text-red-600">
                ${expense.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

