import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  status: string;
}

const columnHelper = createColumnHelper<Invoice>();

const columns = [
  columnHelper.accessor('invoice_number', {
    header: 'Invoice #',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('customer_name', {
    header: 'Customer',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('invoice_date', {
    header: 'Date',
    cell: info => new Date(info.getValue()).toLocaleDateString(),
  }),
  columnHelper.accessor('due_date', {
    header: 'Due Date',
    cell: info => new Date(info.getValue()).toLocaleDateString(),
  }),
  columnHelper.accessor('total_amount', {
    header: 'Total',
    cell: info => `$${info.getValue().toFixed(2)}`,
  }),
  columnHelper.accessor('balance_amount', {
    header: 'Balance',
    cell: info => `$${info.getValue().toFixed(2)}`,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: info => {
      const status = info.getValue();
      const colorClass = {
        paid: 'bg-green-100 text-green-800',
        sent: 'bg-blue-100 text-blue-800',
        draft: 'bg-yellow-100 text-yellow-800',
        overdue: 'bg-red-100 text-red-800',
      }[status] || 'bg-gray-100 text-gray-800';
      return <span className={`px-2 py-1 text-xs rounded ${colorClass}`}>{status}</span>;
    },
  }),
];

export function InvoiceList() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['accounting-invoices'],
    queryFn: async () => {
      // TODO: Replace with actual API call
      return [] as Invoice[];
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Accounting Invoices</h1>
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
                    No invoices found
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

