import { Card } from './card';
import { PriceChange } from './price-change';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeType?: 'gain' | 'loss' | 'neutral';
  icon?: LucideIcon;
  className?: string;
}

export function MetricCard({ label, value, change, changeType, icon: Icon, className }: MetricCardProps) {
  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
            {value}
          </p>
          {change !== undefined && (
            <div className="mt-2">
              <PriceChange value={change} size="sm" />
            </div>
          )}
        </div>
        {Icon && (
          <div className="ml-4">
            <Icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
        )}
      </div>
    </Card>
  );
}
