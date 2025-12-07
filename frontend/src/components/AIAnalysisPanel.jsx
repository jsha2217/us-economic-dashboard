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
            {/* 헤더 - 모바일 최적화 */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                                🤖 AI 경제 분석
                            </h2>
                            <p className="text-purple-100 text-xs sm:text-sm mt-1">
                                Google Gemini 2.5 Flash
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {/* 재생성 버튼 */}
                        <button
                            onClick={generateAnalysis}
                            disabled={loading}
                            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition text-sm flex-1 sm:flex-initial justify-center ${
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

            {/* 내용 - 모바일 최적화 */}
            {isExpanded && (
                <div className="p-4 sm:p-6">
                    {/* 로딩 */}
                    {loading && (
                        <div className="text-center py-8 sm:py-12">
                            <div className="inline-flex items-center gap-3 px-4 sm:px-6 py-3 bg-white rounded-lg shadow-md">
                                <RefreshCw className="w-5 h-5 text-purple-600 animate-spin" />
                                <span className="text-purple-600 font-medium text-sm sm:text-base">
                  AI가 경제 지표를 분석하는 중입니다...
                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500 mt-4">
                                약 5-10초 소요됩니다
                            </p>
                        </div>
                    )}

                    {/* 에러 */}
                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 sm:p-5">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0 mt-1" />
                                <div className="flex-1">
                                    <h3 className="text-red-800 font-bold mb-2 text-sm sm:text-base">분석 생성 실패</h3>
                                    <p className="text-red-600 text-xs sm:text-sm">{error}</p>
                                    <button
                                        onClick={generateAnalysis}
                                        className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-xs sm:text-sm font-medium"
                                    >
                                        다시 시도
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 분석 결과 - 모바일 최적화 */}
                    {!loading && !error && analysis && (
                        <div className="space-y-4 sm:space-y-5">
                            {/* 전체 요약 */}
                            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-purple-100">
                                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2">
                                    📊 전체 요약
                                </h3>
                                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                                    {analysis.analysis.summary}
                                </p>
                            </div>

                            {/* 미국 증시 투자 전망 */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 shadow-sm border-2 border-blue-200">
                                <h3 className="text-base sm:text-lg font-bold text-blue-900 mb-2 sm:mb-3 flex items-center gap-2">
                                    📈 미국 증시 투자 전망
                                </h3>
                                <p className="text-blue-900 leading-relaxed text-sm sm:text-base font-medium">
                                    {analysis.analysis.outlook}
                                </p>
                            </div>

                            {/* 모델 정보 */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm text-gray-500 pt-4 border-t border-purple-100 gap-3 sm:gap-0">
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

                    {/* 초기 상태 - 모바일 최적화 */}
                    {!loading && !error && !analysis && (
                        <div className="text-center py-8 sm:py-12">
                            <div className="bg-white rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 shadow-md">
                                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                                AI 경제 분석을 시작하세요
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-6 px-4">
                                Google Gemini가 현재 경제 지표를 종합 분석하고
                                <br className="hidden sm:block" />
                                미국 증시 투자 전망을 제시합니다
                            </p>
                            <button
                                onClick={generateAnalysis}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 font-semibold shadow-md transition text-sm sm:text-base"
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