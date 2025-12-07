/**
 * 경제 지표 카드 컴포넌트
 * Quick Metrics용
 */
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function IndicatorCard({ title, value, unit = '', change, changePercent, date, icon, color = 'blue' }) {
    // 변화 추세 아이콘
    const getTrendIcon = () => {
        if (!change) return <Minus className="w-5 h-5" />;
        if (change > 0) return <TrendingUp className="w-5 h-5" />;
        return <TrendingDown className="w-5 h-5" />;
    };

    // 변화 색상
    const getTrendColor = () => {
        if (!change) return 'text-gray-600';
        if (change > 0) return 'text-green-600';
        return 'text-red-600';
    };

    // 카드 색상
    const colorClasses = {
        blue: 'border-blue-200 bg-blue-50',
        orange: 'border-orange-200 bg-orange-50',
        green: 'border-green-200 bg-green-50',
        purple: 'border-purple-200 bg-purple-50',
        indigo: 'border-indigo-200 bg-indigo-50'
    };

    const textColorClasses = {
        blue: 'text-blue-600',
        orange: 'text-orange-600',
        green: 'text-green-600',
        purple: 'text-purple-600',
        indigo: 'text-indigo-600'
    };

    return (
        <div className={`rounded-lg border-2 p-5 ${colorClasses[color]} hover:shadow-md transition`}>
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {icon && <span className="text-2xl">{icon}</span>}
                    <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
                </div>
                <div className={getTrendColor()}>
                    {getTrendIcon()}
                </div>
            </div>

            {/* 값 */}
            <div className="mb-2">
                <p className={`text-4xl font-bold ${textColorClasses[color]}`}>
                    {value}{unit}
                </p>
            </div>

            {/* 변화량 */}
            {(change !== null && change !== undefined) && (
                <div className={`flex items-center gap-2 text-sm ${getTrendColor()}`}>
          <span className="font-semibold">
            {change > 0 ? '+' : ''}{change}{unit}
          </span>
                    {changePercent && (
                        <span className="font-medium">
              ({changePercent > 0 ? '+' : ''}{changePercent}%)
            </span>
                    )}
                </div>
            )}

            {/* 날짜 */}
            {date && (
                <p className="text-xs text-gray-500 mt-2">{date}</p>
            )}
        </div>
    );
}

export default IndicatorCard;