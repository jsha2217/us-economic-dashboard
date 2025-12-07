import { useState, useEffect } from 'react';
import { api } from './services/api';
import Header from './components/Header';
import IndicatorCard from './components/IndicatorCard';
import InterestRateChart from './components/charts/InterestRateChart';
import InflationChart from './components/charts/InflationChart';
import EmploymentChart from './components/charts/EmploymentChart';
import GDPChart from './components/charts/GDPChart';
import LEIChart from './components/charts/LEIChart';
import './App.css';

function App() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const summaryData = await api.getSummary();
            setSummary(summaryData);
            setLastUpdated(summaryData.updated_at);

        } catch (err) {
            setError(err.message);
            console.error('데이터 로드 에러:', err);
        } finally {
            setLoading(false);
        }
    };

    // Quick Metrics 데이터 추출
    const getQuickMetrics = () => {
        if (!summary) return null;

        const metrics = [];

        // 기준금리
        if (summary.summary.interest_rates?.DFF) {
            const dff = summary.summary.interest_rates.DFF;
            metrics.push({
                title: '연준 기준금리',
                value: dff.value,
                unit: '%',
                date: dff.date,
                icon: '💰',
                color: 'blue'
            });
        }

        // CPI
        if (summary.summary.inflation?.CPIAUCSL) {
            const cpi = summary.summary.inflation.CPIAUCSL;
            metrics.push({
                title: '소비자물가(CPI)',
                value: cpi.value,
                unit: '',
                date: cpi.date,
                icon: '📈',
                color: 'orange'
            });
        }

        // 실업률
        if (summary.summary.employment?.UNRATE) {
            const unrate = summary.summary.employment.UNRATE;
            metrics.push({
                title: '실업률',
                value: unrate.value,
                unit: '%',
                date: unrate.date,
                icon: '💼',
                color: 'green'
            });
        }

        // GDP 성장률
        if (summary.summary.gdp?.A191RL1Q225SBEA) {
            const growth = summary.summary.gdp.A191RL1Q225SBEA;
            metrics.push({
                title: 'GDP 성장률',
                value: growth.value,
                unit: '%',
                date: growth.date,
                icon: '📊',
                color: 'purple'
            });
        }

        // 소비자심리
        if (summary.summary.leading?.UMCSENT) {
            const sentiment = summary.summary.leading.UMCSENT;
            metrics.push({
                title: '소비자심리지수',
                value: sentiment.value,
                unit: '',
                date: sentiment.date,
                icon: '🔮',
                color: 'indigo'
            });
        }

        return metrics;
    };

    const quickMetrics = getQuickMetrics();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 헤더 */}
            <Header
                onRefresh={loadData}
                lastUpdated={lastUpdated}
                loading={loading}
            />

            <main className="max-w-7xl mx-auto px-8 py-8">
                {/* 에러 */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
                        <h3 className="text-red-700 font-bold mb-2 text-lg">❌ 에러 발생</h3>
                        <p className="text-red-600 mb-3">{error}</p>
                        <p className="text-sm text-red-500 mb-4">
                            💡 백엔드 서버가 실행 중인지 확인하세요: http://localhost:8000
                        </p>
                        <button
                            onClick={loadData}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold"
                        >
                            다시 시도
                        </button>
                    </div>
                )}

                {/* Quick Metrics */}
                {!loading && !error && quickMetrics && (
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            ⚡ 주요 지표
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {quickMetrics.map((metric, index) => (
                                <IndicatorCard key={index} {...metric} />
                            ))}
                        </div>
                    </section>
                )}

                {/* 차트 섹션 */}
                {!loading && !error && (
                    <section className="space-y-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            📊 상세 차트
                        </h2>

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
                    </section>
                )}

                {/* 전체 요약 (접을 수 있게) */}
                {summary && (
                    <section className="mt-8">
                        <details className="bg-white border border-gray-200 rounded-lg">
                            <summary className="p-6 cursor-pointer hover:bg-gray-50 font-semibold text-lg text-gray-800">
                                📋 전체 지표 상세 정보
                            </summary>

                            <div className="p-6 pt-0 space-y-6">
                                {/* 금리 */}
                                {summary.summary.interest_rates && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                            💰 금리 (Interest Rates)
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {Object.entries(summary.summary.interest_rates).map(([key, data]) => (
                                                <div key={key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <p className="text-sm text-gray-600 mb-1">{data.name}</p>
                                                    <p className="text-2xl font-bold text-blue-600">
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
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                            📈 물가 (Inflation)
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {Object.entries(summary.summary.inflation).map(([key, data]) => (
                                                <div key={key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <p className="text-sm text-gray-600 mb-1">{data.name}</p>
                                                    <p className="text-2xl font-bold text-orange-600">
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
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                            💼 고용 (Employment)
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {Object.entries(summary.summary.employment).map(([key, data]) => (
                                                <div key={key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <p className="text-sm text-gray-600 mb-1">{data.name}</p>
                                                    <p className="text-2xl font-bold text-green-600">
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
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                            📊 GDP 및 성장
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {Object.entries(summary.summary.gdp).map(([key, data]) => (
                                                <div key={key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <p className="text-sm text-gray-600 mb-1">{data.name}</p>
                                                    <p className="text-2xl font-bold text-purple-600">
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
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                            🔮 경기선행지수
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {Object.entries(summary.summary.leading).map(([key, data]) => (
                                                <div key={key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <p className="text-sm text-gray-600 mb-1">{data.name}</p>
                                                    <p className="text-2xl font-bold text-indigo-600">
                                                        {data.value.toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">{data.date}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </details>
                    </section>
                )}

                {/* 푸터 */}
                <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                    <p>데이터 출처: Federal Reserve Economic Data (FRED)</p>
                    <p className="mt-2">© 2025 US Economic Dashboard</p>
                </footer>
            </main>
        </div>
    );
}

export default App;