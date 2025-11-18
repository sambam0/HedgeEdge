'use client';

import { useCompanyOverview } from '@/lib/hooks/useMarket';

interface CompanyInfoCardProps {
  ticker: string;
}

export function CompanyInfoCard({ ticker }: CompanyInfoCardProps) {
  const { data: company, isLoading, error } = useCompanyOverview(ticker);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
        <div className="text-gray-600 dark:text-gray-400">Loading company information...</div>
      </div>
    );
  }

  if (error || !company) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Company Info
      </h3>

      <div className="space-y-3">
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Company Name</div>
          <div className="text-base font-medium text-gray-900 dark:text-white">
            {company.name}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sector</div>
            <div className="text-base font-medium text-gray-900 dark:text-white">
              {company.sector || 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Industry</div>
            <div className="text-base font-medium text-gray-900 dark:text-white">
              {company.industry || 'N/A'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Market Cap</div>
            <div className="text-base font-medium text-gray-900 dark:text-white">
              {company.market_cap ? `$${(company.market_cap / 1e9).toFixed(2)}B` : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">P/E Ratio</div>
            <div className="text-base font-medium text-gray-900 dark:text-white">
              {company.pe_ratio ? company.pe_ratio.toFixed(2) : 'N/A'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">EPS</div>
            <div className="text-base font-medium text-gray-900 dark:text-white">
              {company.eps ? `$${company.eps.toFixed(2)}` : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Dividend Yield</div>
            <div className="text-base font-medium text-gray-900 dark:text-white">
              {company.dividend_yield ? (company.dividend_yield * 100).toFixed(2) + '%' : 'N/A'}
            </div>
          </div>
        </div>

        {company.description && (
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Description</div>
            <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4">
              {company.description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
