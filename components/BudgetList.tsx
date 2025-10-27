import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

interface Budget {
  id: string;
  budget_name: string;
  fiscal_year: number;
  account_name: string;
  budgeted_amount: number;
  actual_amount: number;
  variance_amount: number;
  status: string;
}

const columnHelper = createColumnHelper<Budget>();

const columns = [
  columnHelper.accessor('budget_name', {
    header: 'Budget Name',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('fiscal_year', {
    header: 'Fiscal Year',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('account_name', {
    header: 'Account',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('budgeted_amount', {
    header: 'Budgeted',
    cell: info => `$${info.getValue().toFixed(2)}`,
  }),
  columnHelper.accessor('actual_amount', {
    header: 'Actual',
    cell: info => `$${info.getValue().toFixed(2)}`,
  }),
  columnHelper.accessor('variance_amount', {
    header: 'Variance',
    cell: info => {
      const variance = info.getValue();
      const color = variance >= 0 ? 'text-green-600' : 'text-red-600';
      return <span className={color}>${variance.toFixed(2)}</span>;
    },
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: info => {
      const status = info.getValue();
      const colorClass = {
        active: 'bg-green-100 text-green-800',
        draft: 'bg-yellow-100 text-yellow-800',
        closed: 'bg-gray-100 text-gray-800',
      }[status] || 'bg-gray-100 text-gray-800';
      return <span className={`px-2 py-1 text-xs rounded ${colorClass}`}>{status}</span>;
    },
  }),
];

export function BudgetList() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['accounting-budgets'],
    queryFn: async () => {
      const response = await fetch('/api/modules/accounting/budgets');
      const result = await response.json();
      return result.budgets || [] as Budget[];
    },
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Budgets</h1>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-gray-500">
                    No budgets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

