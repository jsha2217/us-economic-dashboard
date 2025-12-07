/**
 * 고용 차트 컴포넌트
 * 실업률, 비농업 고용, 신규 실업수당 청구 추이
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
import { TrendingDown, TrendingUp } from 'lucide-react';
import { api } from '../../services/api';

function EmploymentChart() {
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

            const response = await api.getEmployment(period);
            const processedData = processChartData(response.data);
            setData(processedData);

        } catch (err) {
            setError(err.message);
            console.error('고용 데이터 로드 에러:', err);
        } finally {
            setLoading(false);
        }
    };

    const processChartData = (rawData) => {
        const unrateData = rawData.UNRATE?.data || [];
        const payemsData = rawData.PAYEMS?.data || [];

        const dataMap = {};

        unrateData.forEach(item => {
            if (!dataMap[item.date]) {
                dataMap[item.date] = { date: item.date };
            }
            dataMap[item.date].unrate = item.value;
        });

        // 비농업 고용은 절대값이 너무 커서 천 단위로 변환
        payemsData.forEach(item => {
            if (!dataMap[item.date]) {
                dataMap[item.date] = { date: item.date };
            }
            dataMap[item.date].payems = item.value;
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
                {entry.dataKey === 'unrate'
                    ? `${entry.value}%`
                    : `${(entry.value / 1000).toFixed(0)}M`}
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
                        💼 고용 지표 추이
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        실업률 및 비농업 고용
                    </p>
                </div>

                <div className="flex gap-2">
                    {['1y', '3y', '5y'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1 rounded text-sm font-medium transition ${
                                period === p
                                    ? 'bg-green-600 text-white'
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
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
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

                        {/* 실업률 Y축 (왼쪽) */}
                        <YAxis
                            yAxisId="left"
                            label={{ value: '실업률 (%)', angle: -90, position: 'insideLeft' }}
                            tick={{ fontSize: 12 }}
                            stroke="#6b7280"
                        />

                        {/* 비농업 고용 Y축 (오른쪽) */}
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            label={{ value: '비농업 고용 (천 명)', angle: 90, position: 'insideRight' }}
                            tick={{ fontSize: 12 }}
                            stroke="#6b7280"
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}M`}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="line"
                        />

                        {/* 실업률 */}
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="unrate"
                            name="실업률"
                            stroke="#dc2626"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />

                        {/* 비농업 고용 */}
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="payems"
                            name="비농업 고용"
                            stroke="#16a34a"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}

            {/* 인사이트 */}
            {!loading && !error && data.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="w-5 h-5 text-red-600" />
                            <p className="text-sm font-semibold text-red-800">실업률</p>
                        </div>
                        <p className="text-2xl font-bold text-red-600">
                            {data[data.length - 1]?.unrate}%
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                            낮을수록 좋음 (고용 안정)
                        </p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            <p className="text-sm font-semibold text-green-800">비농업 고용</p>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                            {((data[data.length - 1]?.payems || 0) / 1000).toFixed(1)}M
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                            높을수록 좋음 (일자리 증가)
                        </p>
                    </div>
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

export default EmploymentChart;