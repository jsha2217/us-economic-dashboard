/**
 * 경기선행지수 차트 컴포넌트
 * Consumer Sentiment, Housing Permits, Retail Sales
 */
import { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { api } from '../../services/api';

function LEIChart() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState('3y');

    useEffect(() => {
        loadData();
    }, [period]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.getLeadingIndicators(period);
            const processedData = processChartData(response.data);
            setData(processedData);

        } catch (err) {
            setError(err.message);
            console.error('경기선행지수 데이터 로드 에러:', err);
        } finally {
            setLoading(false);
        }
    };

    const processChartData = (rawData) => {
        const sentimentData = rawData.UMCSENT?.data || [];
        const permitData = rawData.PERMIT?.data || [];
        const retailData = rawData.RETAILSMNSA?.data || [];

        const dataMap = {};

        sentimentData.forEach(item => {
            if (!dataMap[item.date]) {
                dataMap[item.date] = { date: item.date };
            }
            dataMap[item.date].sentiment = item.value;
        });

        permitData.forEach(item => {
            if (!dataMap[item.date]) {
                dataMap[item.date] = { date: item.date };
            }
            dataMap[item.date].permit = item.value;
        });

        retailData.forEach(item => {
            if (!dataMap[item.date]) {
                dataMap[item.date] = { date: item.date };
            }
            dataMap[item.date].retail = item.value;
        });

        const chartData = Object.values(dataMap)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        return chartData;
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short'
        });
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                        {formatDate(label)}
                    </p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: <span className="font-bold">
                {entry.dataKey === 'permit'
                    ? entry.value?.toFixed(0)
                    : entry.value?.toFixed(1)}
              </span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // 추세 계산
    const calculateTrend = (dataKey) => {
        if (data.length < 2) return 'stable';

        const recent = data.slice(-3);
        const values = recent.map(d => d[dataKey]).filter(v => v !== undefined);

        if (values.length < 2) return 'stable';

        const first = values[0];
        const last = values[values.length - 1];
        const change = ((last - first) / first) * 100;

        if (change > 1) return 'up';
        if (change < -1) return 'down';
        return 'stable';
    };

    const getTrendIcon = (trend) => {
        if (trend === 'up') return <TrendingUp className="w-5 h-5 text-green-600" />;
        if (trend === 'down') return <TrendingDown className="w-5 h-5 text-red-600" />;
        return <Minus className="w-5 h-5 text-gray-600" />;
    };

    const getTrendColor = (trend) => {
        if (trend === 'up') return 'text-green-600 bg-green-50 border-green-200';
        if (trend === 'down') return 'text-red-600 bg-red-50 border-red-200';
        return 'text-gray-600 bg-gray-50 border-gray-200';
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* 헤더 */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        🔮 경기선행지표
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        소비자심리, 주택건축허가, 소매판매
                    </p>
                </div>

                {/* 기간 선택 */}
                <div className="flex gap-2">
                    {['1y', '3y', '5y'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1 rounded text-sm font-medium transition ${
                                period === p
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {p.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* 로딩 */}
            {loading && (
                <div className="h-96 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">데이터를 불러오는 중...</p>
                    </div>
                </div>
            )}

            {/* 에러 */}
            {error && (
                <div className="h-96 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">❌ {error}</p>
                        <button
                            onClick={loadData}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                            다시 시도
                        </button>
                    </div>
                </div>
            )}

            {/* 차트 */}
            {!loading && !error && data.length > 0 && (
                <>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                            <XAxis
                                dataKey="date"
                                tickFormatter={(date) => {
                                    const d = new Date(date);
                                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                                }}
                                tick={{ fontSize: 12 }}
                                stroke="#6b7280"
                            />

                            {/* 소비자심리 / 소매판매 Y축 (왼쪽) */}
                            <YAxis
                                yAxisId="left"
                                label={{ value: 'Sentiment / Retail Sales', angle: -90, position: 'insideLeft' }}
                                tick={{ fontSize: 12 }}
                                stroke="#6b7280"
                            />

                            {/* 주택허가 Y축 (오른쪽) */}
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                label={{ value: 'Permits (천 건)', angle: 90, position: 'insideRight' }}
                                tick={{ fontSize: 12 }}
                                stroke="#6b7280"
                            />

                            <Tooltip content={<CustomTooltip />} />

                            <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="line"
                            />

                            {/* Consumer Sentiment */}
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="sentiment"
                                name="소비자심리지수"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6 }}
                            />

                            {/* Retail Sales */}
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="retail"
                                name="소매판매 (Billion $)"
                                stroke="#6366f1"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6 }}
                            />

                            {/* Housing Permits */}
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="permit"
                                name="주택 건축 허가"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>

                    {/* 추세 인사이트 */}
                    <div className="mt-6 grid grid-cols-3 gap-4">
                        <div className={`p-4 rounded-lg border ${getTrendColor(calculateTrend('sentiment'))}`}>
                            <div className="flex items-center gap-2 mb-2">
                                {getTrendIcon(calculateTrend('sentiment'))}
                                <p className="text-sm font-semibold">소비자심리</p>
                            </div>
                            <p className="text-xs opacity-75">
                                {calculateTrend('sentiment') === 'up' ? '개선 중' :
                                    calculateTrend('sentiment') === 'down' ? '악화 중' : '보합'}
                            </p>
                        </div>

                        <div className={`p-4 rounded-lg border ${getTrendColor(calculateTrend('permit'))}`}>
                            <div className="flex items-center gap-2 mb-2">
                                {getTrendIcon(calculateTrend('permit'))}
                                <p className="text-sm font-semibold">주택 허가</p>
                            </div>
                            <p className="text-xs opacity-75">
                                {calculateTrend('permit') === 'up' ? '증가 추세' :
                                    calculateTrend('permit') === 'down' ? '감소 추세' : '보합'}
                            </p>
                        </div>

                        <div className={`p-4 rounded-lg border ${getTrendColor(calculateTrend('retail'))}`}>
                            <div className="flex items-center gap-2 mb-2">
                                {getTrendIcon(calculateTrend('retail'))}
                                <p className="text-sm font-semibold">소매판매</p>
                            </div>
                            <p className="text-xs opacity-75">
                                {calculateTrend('retail') === 'up' ? '증가 추세' :
                                    calculateTrend('retail') === 'down' ? '감소 추세' : '보합'}
                            </p>
                        </div>
                    </div>
                </>
            )}

            {/* 설명 */}
            {!loading && !error && data.length > 0 && (
                <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p className="text-sm text-indigo-800">
                        <strong>💡 참고:</strong> 소비자심리지수, 주택건축허가, 소매판매는 향후 경기 동향을 예측하는 선행지표입니다.
                        이들이 동시에 상승하면 경기 확장, 하락하면 경기 둔화 신호입니다.
                    </p>
                </div>
            )}

            {/* 데이터 없음 */}
            {!loading && !error && data.length === 0 && (
                <div className="h-96 flex items-center justify-center">
                    <p className="text-gray-500">표시할 데이터가 없습니다.</p>
                </div>
            )}
        </div>
    );
}

export default LEIChart;