import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

interface TaxCode {
  id: string;
  code: string;
  name: string;
  rate: number;
  type: string;
  is_active: boolean;
  effective_from: string;
}

const columnHelper = createColumnHelper<TaxCode>();

const columns = [
  columnHelper.accessor('code', {
    header: 'Code',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('name', {
    header: 'Name',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('rate', {
    header: 'Rate',
    cell: info => `${info.getValue()}%`,
  }),
  columnHelper.accessor('type', {
    header: 'Type',
    cell: info => info.getValue().replace('_', ' ').toUpperCase(),
  }),
  columnHelper.accessor('effective_from', {
    header: 'Effective From',
    cell: info => new Date(info.getValue()).toLocaleDateString(),
  }),
  columnHelper.accessor('is_active', {
    header: 'Status',
    cell: info => (
      <span className={`px-2 py-1 text-xs rounded ${
        info.getValue() ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {info.getValue() ? 'Active' : 'Inactive'}
      </span>
    ),
  }),
];

export function TaxCodeList() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['tax-codes'],
    queryFn: async () => {
      // TODO: Replace with actual API call
      return [] as TaxCode[];
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Tax Codes</h1>
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
                    No tax codes found
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

