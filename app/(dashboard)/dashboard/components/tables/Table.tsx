"use client";

interface GenericTableProps {
  title?: string;
  headers: React.ReactNode[];
  rows: React.ReactNode[][];
  className?: string;
  maxHeight?: string;
}

export default function GenericTable({
  title,
  headers,
  rows,
  className = "",
  maxHeight = "64",
}: GenericTableProps) {
  return (
    <div>
      {title && (
        <label className="block text-gray-400 mb-2">{title}</label>
      )}

      <div className={`overflow-x-auto rounded-lg border border-gray-700 bg-[#1f2330] max-h-${maxHeight} overflow-y-auto ${className}`}>

        <table className="w-full text-left text-gray-300">
          <thead className="bg-[#14171f] text-gray-400 sticky top-0">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="px-4 py-2">
                {header}
              </th>
            ))}
          </tr>
          </thead>

          <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={headers.length} className="px-4 py-2 text-center text-gray-500">
                No data
              </td>
            </tr>
          )}

          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-gray-700">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}