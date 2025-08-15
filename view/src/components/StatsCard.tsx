import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  className = "",
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}
    >
      <div className="flex items-center">
        {icon && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
              <div className="w-5 h-5 text-blue-600">{icon}</div>
            </div>
          </div>
        )}
        <div className="ml-4 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {value}
              </div>
              {trend && (
                <div
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <span className="sr-only">
                    {trend.isPositive ? "Aumentou" : "Diminuiu"} em{" "}
                    {trend.value}%
                  </span>
                  {trend.isPositive ? "↗" : "↘"} {trend.value}%
                  <span className="ml-1 text-gray-500 font-normal">
                    {trend.label}
                  </span>
                </div>
              )}
            </dd>
            {description && (
              <dd className="text-sm text-gray-600 mt-1">{description}</dd>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
