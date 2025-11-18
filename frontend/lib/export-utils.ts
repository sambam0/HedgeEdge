/**
 * Export utilities for CSV and JSON data export
 */

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; header: string }[]
) {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Determine columns - use provided columns or infer from first data object
  const cols = columns || Object.keys(data[0]).map(key => ({ key, header: key }));

  // Create CSV header
  const header = cols.map(col => col.header).join(',');

  // Create CSV rows
  const rows = data.map(row =>
    cols.map(col => {
      const value = row[col.key];
      const stringValue = String(value ?? '');

      // Escape commas and quotes in CSV
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  );

  // Combine header and rows
  const csv = [header, ...rows].join('\n');

  // Create and trigger download
  downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

export function exportToJSON<T>(data: T, filename: string, pretty: boolean = true) {
  if (!data) {
    console.warn('No data to export');
    return;
  }

  // Convert to JSON string
  const json = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);

  // Create and trigger download
  downloadFile(json, `${filename}.json`, 'application/json');
}

/**
 * Helper function to trigger file download in browser
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  // Create blob
  const blob = new Blob([content], { type: mimeType });

  // Create temporary URL
  const url = URL.createObjectURL(blob);

  // Create temporary link element
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up URL
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Export table data to Excel-compatible CSV
 */
export function exportTableToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columnMapping: Record<keyof T, string>
) {
  const columns = Object.entries(columnMapping).map(([key, header]) => ({
    key: key as keyof T,
    header: header as string,
  }));

  exportToCSV(data, filename, columns);
}

// Usage examples:
//
// Export portfolio positions:
// exportToCSV(
//   portfolioPositions,
//   'portfolio-positions',
//   [
//     { key: 'ticker', header: 'Symbol' },
//     { key: 'shares', header: 'Shares' },
//     { key: 'cost_basis', header: 'Cost Basis' },
//     { key: 'current_price', header: 'Current Price' },
//     { key: 'current_value', header: 'Current Value' },
//     { key: 'profit_loss', header: 'P&L' },
//   ]
// );
//
// Export to JSON:
// exportToJSON(portfolioData, 'portfolio-data');
