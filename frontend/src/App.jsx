import { useState, useEffect } from 'react';
import { api } from './services/api';
import InterestRateChart from './components/charts/InterestRateChart';
import InflationChart from './components/charts/InflationChart';
import EmploymentChart from './components/charts/EmploymentChart';
import GDPChart from './components/charts/GDPChart';
import LEIChart from './components/charts/LEIChart';
import './App.css';

function App() {
    const [healthStatus, setHealthStatus] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const health = await api.healthCheck();
            setHealthStatus(health);

            const summaryData = await api.getSummary();
            setSummary(summaryData);

        } catch (err) {
            setError(err.message);
            console.error('데이터 로드 에러:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-800 mb-8">
                    🇺🇸 US Economic Dashboard
                </h1>

                {/* 로딩 */}
                {loading && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <p className="text-blue-700">⏳ 데이터를 불러오는 중...</p>
                    </div>
                )}

                {/* 에러 */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                        <h3 className="text-red-700 font-bold mb-2">❌ 에러 발생</h3>
                        <p className="text-red-600 mb-2">{error}</p>
                        <p className="text-sm text-red-500">
                            💡 백엔드 서버가 실행 중인지 확인하세요: http://localhost:8000
                        </p>
                        <button
                            onClick={loadData}
                            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                            다시 시도
                        </button>
                    </div>
                )}

                {/* 백엔드 연결 성공 */}
                {healthStatus && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                        <h3 className="text-green-700 font-bold mb-2">✅ 백엔드 연결 성공!</h3>
                        <p className="text-green-600">상태: {healthStatus.status}</p>
                    </div>
                )}

                {/* 차트 섹션 */}
                {!loading && !error && (
                    <div className="space-y-8 mb-8">
                        {/* 금리 차트 */}
                        <InterestRateChart />

                        {/* 물가 차트 */}
                        <InflationChart />

                        {/* 고용 차트 */}
                        <EmploymentChart />

                        {/* GDP 차트 */}
                        <GDPChart />

                        {/* 경기선행지수 */}
                        <LEIChart />
                    </div>
                )}

                {/* 경제 지표 요약 */}
                {summary && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            📊 경제 지표 요약
                        </h2>

                        {/* 금리 */}
                        {summary.summary.interest_rates && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                    💰 금리 (Interest Rates)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Object.entries(summary.summary.interest_rates).map(([key, data]) => (
                                        <div key={key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <p className="text-sm text-gray-600 mb-1">{data.name}</p>
                                            <p className="text-3xl font-bold text-blue-600">
                                                {data.value}%
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">{data.date}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 물가 */}
                        {summary.summary.inflation && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                    📈 물가 (Inflation)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Object.entries(summary.summary.inflation).map(([key, data]) => (
                                        <div key={key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <p className="text-sm text-gray-600 mb-1">{data.name}</p>
                                            <p className="text-3xl font-bold text-orange-600">
                                                {data.value}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">{data.date}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 고용 */}
                        {summary.summary.employment && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                    💼 고용 (Employment)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Object.entries(summary.summary.employment).map(([key, data]) => (
                                        <div key={key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <p className="text-sm text-gray-600 mb-1">{data.name}</p>
                                            <p className="text-3xl font-bold text-green-600">
                                                {key === 'UNRATE' ? `${data.value}%` : data.value.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">{data.date}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* GDP */}
                        {summary.summary.gdp && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                    📊 GDP 및 성장
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Object.entries(summary.summary.gdp).map(([key, data]) => (
                                        <div key={key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <p className="text-sm text-gray-600 mb-1">{data.name}</p>
                                            <p className="text-3xl font-bold text-purple-600">
                                                {key === 'A191RL1Q225SBEA'
                                                    ? `${data.value}%`
                                                    : data.value.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">{data.date}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 경기선행지수 */}
                        {summary.summary.leading && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                    🔮 경기선행지수
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Object.entries(summary.summary.leading).map(([key, data]) => (
                                        <div key={key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <p className="text-sm text-gray-600 mb-1">{data.name}</p>
                                            <p className="text-3xl font-bold text-indigo-600">
                                                {data.value.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">{data.date}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <p className="text-sm text-gray-500 mt-6 pt-4 border-t border-gray-200">
                            마지막 업데이트: {new Date(summary.updated_at).toLocaleString('ko-KR')}
                        </p>
                    </div>
                )}

                {/* 새로고침 버튼 */}
                {!loading && (
                    <button
                        onClick={loadData}
                        className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                        🔄 새로고침
                    </button>
                )}
            </div>
        </div>
    );
}

export default App;