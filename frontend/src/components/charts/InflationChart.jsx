/**
 * 물가 차트 컴포넌트
 * CPI, Core CPI, PCE, Core PCE 추이
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
import { api } from '../../services/api';

function InflationChart() {
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

            const response = await api.getInflation(period);
            const processedData = processChartData(response.data);
            setData(processedData);

        } catch (err) {
            setError(err.message);
            console.error('물가 데이터 로드 에러:', err);
        } finally {
            setLoading(false);
        }
    };

    const processChartData = (rawData) => {
        const cpiData = rawData.CPIAUCSL?.data || [];
        const coreCpiData = rawData.CPILFESL?.data || [];
        const pceData = rawData.PCEPI?.data || [];
        const corePceData = rawData.PCEPILFE?.data || [];

        const dataMap = {};

        cpiData.forEach(item => {
            if (!dataMap[item.date]) {
                dataMap[item.date] = { date: item.date };
            }
            dataMap[item.date].cpi = item.value;
        });

        coreCpiData.forEach(item => {
            if (!dataMap[item.date]) {
                dataMap[item.date] = { date: item.date };
            }
            dataMap[item.date].coreCpi = item.value;
        });

        pceData.forEach(item => {
            if (!dataMap[item.date]) {
                dataMap[item.date] = { date: item.date };
            }
            dataMap[item.date].pce = item.value;
        });

        corePceData.forEach(item => {
            if (!dataMap[item.date]) {
                dataMap[item.date] = { date: item.date };
            }
            dataMap[item.date].corePce = item.value;
        });

        // YoY 변화율 계산 (간단 버전)
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
                            {entry.name}: <span className="font-bold">{entry.value?.toFixed(1)}</span>
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    📈 물가 지수 추이
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        CPI, Core CPI, PCE, Core PCE
                    </p>
                </div>

                {/* 기간 선택 */}
                <div className="flex gap-1 sm:gap-2">
                    {['1y', '3y', '5y'].map((p) => (
                        <button
                            className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition ${
                                period === p
                                    ? 'bg-orange-600 text-white'
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
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
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

                        <YAxis
                            label={{ value: '지수', angle: -90, position: 'insideLeft' }}
                            tick={{ fontSize: 12 }}
                            stroke="#6b7280"
                        />

                        <Tooltip content={<CustomTooltip />} />

                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="line"
                        />

                        {/* CPI */}
                        <Line
                            type="monotone"
                            dataKey="cpi"
                            name="CPI (소비자물가지수)"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />

                        {/* Core CPI */}
                        <Line
                            type="monotone"
                            dataKey="coreCpi"
                            name="Core CPI (근원 CPI)"
                            stroke="#dc2626"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />

                        {/* PCE */}
                        <Line
                            type="monotone"
                            dataKey="pce"
                            name="PCE"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />

                        {/* Core PCE */}
                        <Line
                            type="monotone"
                            dataKey="corePce"
                            name="Core PCE"
                            stroke="#ec4899"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6 }}
                            strokeDasharray="5 5"
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}

            {/* 설명 */}
            {!loading && !error && data.length > 0 && (
                <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-800">
                        <strong>💡 참고:</strong> Core CPI와 Core PCE는 변동성이 큰 식품과 에너지 가격을 제외한 지수입니다.
                        연준(Fed)은 Core PCE를 물가 목표 지표로 사용합니다.
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

export default InflationChart;