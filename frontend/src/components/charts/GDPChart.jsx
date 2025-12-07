/**
 * GDP 차트 컴포넌트
 * GDP, Real GDP, 성장률, 산업생산지수
 */
import { useState, useEffect } from 'react';
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { api } from '../../services/api';

function GDPChart() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState('5y');

    useEffect(() => {
        loadData();
    }, [period]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.getGDP(period);
            const processedData = processChartData(response.data);
            setData(processedData);

        } catch (err) {
            setError(err.message);
            console.error('GDP 데이터 로드 에러:', err);
        } finally {
            setLoading(false);
        }
    };

    const processChartData = (rawData) => {
        const gdpData = rawData.GDPC1?.data || [];
        const growthData = rawData.A191RL1Q225SBEA?.data || [];
        const indproData = rawData.INDPRO?.data || [];

        const dataMap = {};

        // Real GDP
        gdpData.forEach(item => {
            if (!dataMap[item.date]) {
                dataMap[item.date] = { date: item.date };
            }
            dataMap[item.date].gdp = item.value;
        });

        // GDP 성장률
        growthData.forEach(item => {
            if (!dataMap[item.date]) {
                dataMap[item.date] = { date: item.date };
            }
            dataMap[item.date].growth = item.value;
        });

        // 산업생산지수
        indproData.forEach(item => {
            if (!dataMap[item.date]) {
                dataMap[item.date] = { date: item.date };
            }
            dataMap[item.date].indpro = item.value;
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
                {entry.name === 'GDP 성장률'
                    ? `${entry.value?.toFixed(2)}%`
                    : entry.value?.toFixed(0).toLocaleString()}
              </span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* 헤더 */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        📊 GDP 및 경제 성장
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Real GDP, 성장률, 산업생산지수
                    </p>
                </div>

                {/* 기간 선택 */}
                <div className="flex gap-2">
                    {['3y', '5y', '10y'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p === '10y' ? '5y' : p)}
                            className={`px-3 py-1 rounded text-sm font-medium transition ${
                                period === p
                                    ? 'bg-purple-600 text-white'
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
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
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

            {/* 차트 - Bar + Line 조합 */}
            {!loading && !error && data.length > 0 && (
                <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                        <XAxis
                            dataKey="date"
                            tickFormatter={(date) => {
                                const d = new Date(date);
                                return `${d.getFullYear()}`;
                            }}
                            tick={{ fontSize: 12 }}
                            stroke="#6b7280"
                        />

                        {/* GDP Y축 (왼쪽) */}
                        <YAxis
                            yAxisId="left"
                            label={{ value: 'Real GDP (Billions)', angle: -90, position: 'insideLeft' }}
                            tick={{ fontSize: 12 }}
                            stroke="#6b7280"
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}T`}
                        />

                        {/* 성장률 Y축 (오른쪽) */}
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            label={{ value: '성장률 (%)', angle: 90, position: 'insideRight' }}
                            tick={{ fontSize: 12 }}
                            stroke="#6b7280"
                        />

                        <Tooltip content={<CustomTooltip />} />

                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="line"
                        />

                        {/* GDP 성장률 (막대 그래프) */}
                        <Bar
                            yAxisId="right"
                            dataKey="growth"
                            name="GDP 성장률"
                            fill="#8b5cf6"
                            opacity={0.8}
                        />

                        {/* Real GDP (라인) */}
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="gdp"
                            name="Real GDP"
                            stroke="#1e40af"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />

                        {/* 산업생산지수 (라인) */}
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="indpro"
                            name="산업생산지수"
                            stroke="#16a34a"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6 }}
                            strokeDasharray="5 5"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            )}

            {/* 설명 */}
            {!loading && !error && data.length > 0 && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-800">
                        <strong>💡 참고:</strong> GDP 성장률은 전년 동기 대비 변화율입니다.
                        Real GDP는 인플레이션을 제거한 실질 GDP로, 경제의 실제 성장을 나타냅니다.
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

export default GDPChart;