/**
 * 대시보드 헤더 컴포넌트
 */
import { RefreshCw, Calendar } from 'lucide-react';

function Header({ onRefresh, lastUpdated, loading }) {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
            <div className="max-w-7xl mx-auto px-8 py-6">
                <div className="flex justify-between items-center">
                    {/* 로고 및 제목 */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            🇺🇸 US Economic Dashboard
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            실시간 미국 경제 지표 모니터링
                        </p>
                    </div>

                    {/* 업데이트 정보 및 새로고침 버튼 */}
                    <div className="flex items-center gap-4">
                        {/* 마지막 업데이트 시간 */}
                        {lastUpdated && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>마지막 업데이트:</span>
                                <span className="font-medium">{formatDate(lastUpdated)}</span>
                            </div>
                        )}

                        {/* 새로고침 버튼 */}
                        <button
                            onClick={onRefresh}
                            disabled={loading}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                                loading
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? '업데이트 중...' : '새로고침'}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;