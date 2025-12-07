/**
 * AI 분석 패널 컴포넌트
 * Google Gemini를 사용한 경제 분석
 */
import { useState } from 'react';
import { Sparkles, RefreshCw, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

function AIAnalysisPanel() {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(true);

    const generateAnalysis = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🤖 AI 분석 생성 중...');
            const result = await api.generateAnalysis();

            console.log('✅ AI 분석 완료:', result);
            setAnalysis(result);

        } catch (err) {
            console.error('❌ AI 분석 에러:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200 overflow-hidden">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                🤖 AI 경제 분석
                            </h2>
                            <p className="text-purple-100 text-sm mt-1">
                                Google Gemini 2.5 Flash
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* 재생성 버튼 */}
                        <button
                            onClick={generateAnalysis}
                            disabled={loading}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                                loading
                                    ? 'bg-white/20 text-white cursor-not-allowed'
                                    : 'bg-white text-purple-600 hover:bg-purple-50'
                            }`}
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? '분석 중...' : analysis ? '재생성' : '분석 생성'}
                        </button>

                        {/* 접기/펼치기 버튼 */}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition"
                        >
                            {isExpanded ? (
                                <ChevronUp className="w-5 h-5" />
                            ) : (
                                <ChevronDown className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* 내용 */}
            {isExpanded && (
                <div className="p-6">
                    {/* 로딩 */}
                    {loading && (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-lg shadow-md">
                                <RefreshCw className="w-5 h-5 text-purple-600 animate-spin" />
                                <span className="text-purple-600 font-medium">
                  AI가 경제 지표를 분석하는 중입니다...
                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-4">
                                약 5-10초 소요됩니다
                            </p>
                        </div>
                    )}

                    {/* 에러 */}
                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-5">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                                <div className="flex-1">
                                    <h3 className="text-red-800 font-bold mb-2">분석 생성 실패</h3>
                                    <p className="text-red-600 text-sm">{error}</p>
                                    <button
                                        onClick={generateAnalysis}
                                        className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium"
                                    >
                                        다시 시도
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 분석 결과 - 2개 섹션만 */}
                    {!loading && !error && analysis && (
                        <div className="space-y-5">
                            {/* 전체 요약 */}
                            <div className="bg-white rounded-lg p-6 shadow-sm border border-purple-100">
                                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    📊 전체 요약
                                </h3>
                                <p className="text-gray-700 leading-relaxed text-base">
                                    {analysis.analysis.summary}
                                </p>
                            </div>

                            {/* 미국 증시 투자 전망 */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 shadow-sm border-2 border-blue-200">
                                <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                                    📈 미국 증시 투자 전망
                                </h3>
                                <p className="text-blue-900 leading-relaxed text-base font-medium">
                                    {analysis.analysis.outlook}
                                </p>
                            </div>

                            {/* 모델 정보 */}
                            <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-purple-100">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    <span>분석 모델: Google Gemini 2.5 Flash</span>
                                </div>
                                <button
                                    onClick={generateAnalysis}
                                    className="text-purple-600 hover:text-purple-700 font-medium"
                                >
                                    새로운 분석 생성 →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 초기 상태 */}
                    {!loading && !error && !analysis && (
                        <div className="text-center py-12">
                            <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-md">
                                <Sparkles className="w-10 h-10 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                AI 경제 분석을 시작하세요
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Google Gemini가 현재 경제 지표를 종합 분석하고<br />
                                미국 증시 투자 전망을 제시합니다
                            </p>
                            <button
                                onClick={generateAnalysis}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 font-semibold shadow-md transition"
                            >
                                분석 시작하기
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default AIAnalysisPanel;