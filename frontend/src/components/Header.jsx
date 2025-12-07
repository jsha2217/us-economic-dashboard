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
            {/* 👇 모바일 패딩 조정 */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                {/* 👇 모바일: 세로 배치, 데스크톱: 가로 배치 */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    {/* 로고 및 제목 */}
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
                            🇺🇸 US Economic Dashboard
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            실시간 미국 경제 지표 모니터링
                        </p>
                    </div>

                    {/* 업데이트 정보 및 버튼 */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        {/* 마지막 업데이트 시간 */}
                        {lastUpdated && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">마지막 업데이트:</span>
                                <span className="sm:hidden">업데이트:</span>
                                <span className="font-medium">{formatDate(lastUpdated)}</span>
                            </div>
                        )}

                        {/* 새로고침 버튼 */}
                        <button
                            onClick={onRefresh}
                            disabled={loading}
                            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition text-sm sm:text-base w-full sm:w-auto justify-center ${
                                loading
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? '업데이트 중...' : '새로고침'}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;