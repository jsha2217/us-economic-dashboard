/**
 * 금리 차트 컴포넌트
 * Federal Funds Rate, 10Y Treasury, 2Y Treasury 추이
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

function InterestRateChart() {
    // 상태 관리
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState('1y');

    // 데이터 로드
    useEffect(() => {
        loadData();
    }, [period]); // period가 변경될 때마다 다시 로드

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // 백엔드에서 금리 데이터 가져오기
            const response = await api.getInterestRates(period);

            // 데이터 가공: 차트에 맞는 형태로 변환
            const processedData = processChartData(response.data);
            setData(processedData);

        } catch (err) {
            setError(err.message);
            console.error('금리 데이터 로드 에러:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * 백엔드 데이터를 Recharts 형식으로 변환
     */
    const processChartData = (rawData) => {
        // DFF, DGS10, DGS2 데이터 추출
        const dffData = rawData.DFF?.data || [];
        const dgs10Data = rawData.DGS10?.data || [];
        const dgs2Data = rawData.DGS2?.data || [];

        // 날짜별로 데이터 매핑
        const dataMap = {};

        // DFF 데이터 추가
        dffData.forEach(item => {
            if (!dataMap[item.date]) {
                dataMap[item.date] = { date: item.date };
            }
            dataMap[item.date].dff = item.value;
        });

        // DGS10 데이터 추가
        dgs10Data.forEach(item => {
            if (!dataMap[item.date]) {
                dataMap[item.date] = { date: item.date };
            }
            dataMap[item.date].dgs10 = item.value;
        });

        // DGS2 데이터 추가
        dgs2Data.forEach(item => {
            if (!dataMap[item.date]) {
                dataMap[item.date] = { date: item.date };
            }
            dataMap[item.date].dgs2 = item.value;
        });

        // 배열로 변환하고 날짜순 정렬
        const chartData = Object.values(dataMap)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        return chartData;
    };

    /**
     * 날짜 포맷팅 (툴팁용)
     */
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    /**
     * 커스텀 툴팁
     */
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                        {formatDate(label)}
                    </p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: <span className="font-bold">{entry.value}%</span>
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
                        📈 금리 추이
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Federal Funds Rate, 10년물, 2년물 국채 금리
                    </p>
                </div>

                {/* 기간 선택 버튼 */}
                <div className="flex gap-1 sm:gap-2 flex-wrap">
                    {['1m', '3m', '6m', '1y', '3y', '5y'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition ${
                                period === p
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {p.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* 로딩 상태 */}
            {loading && (
                <div className="h-96 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">데이터를 불러오는 중...</p>
                    </div>
                </div>
            )}

            {/* 에러 상태 */}
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
                            label={{ value: '금리 (%)', angle: -90, position: 'insideLeft' }}
                            tick={{ fontSize: 12 }}
                            stroke="#6b7280"
                        />

                        <Tooltip content={<CustomTooltip />} />

                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="line"
                        />

                        {/* Federal Funds Rate (기준금리) */}
                        <Line
                            type="monotone"
                            dataKey="dff"
                            name="기준금리 (Fed Rate)"
                            stroke="#1e40af"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />

                        {/* 10년물 국채 */}
                        <Line
                            type="monotone"
                            dataKey="dgs10"
                            name="10년물 국채"
                            stroke="#16a34a"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />

                        {/* 2년물 국채 */}
                        <Line
                            type="monotone"
                            dataKey="dgs2"
                            name="2년물 국채"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
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

export default InterestRateChart;