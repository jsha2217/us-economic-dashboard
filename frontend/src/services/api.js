/**
 * API 서비스
 * 백엔드 FastAPI와 통신
 */
import axios from 'axios';

// 백엔드 API 주소
const API_BASE_URL = 'http://localhost:8000';

// axios 인스턴스 생성
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    }
});

/**
 * API 응답 에러 처리
 */
const handleApiError = (error, defaultMessage) => {
    if (error.response) {
        console.error('API 에러:', error.response.data);
        throw new Error(error.response.data.detail || defaultMessage);
    } else if (error.request) {
        console.error('네트워크 에러:', error.request);
        throw new Error('서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인하세요.');
    } else {
        console.error('요청 에러:', error.message);
        throw new Error(defaultMessage);
    }
};

/**
 * API 함수들
 */
export const api = {
    // 헬스 체크
    healthCheck: async () => {
        try {
            const response = await apiClient.get('/health');
            return response.data;
        } catch (error) {
            handleApiError(error, '헬스 체크 실패');
        }
    },

    // 금리 지표
    getInterestRates: async (period = '1y') => {
        try {
            const response = await apiClient.get('/api/indicators/interest-rates', {
                params: { period }
            });
            return response.data;
        } catch (error) {
            handleApiError(error, '금리 데이터를 가져오는데 실패했습니다.');
        }
    },

    // 물가 지표
    getInflation: async (period = '1y') => {
        try {
            const response = await apiClient.get('/api/indicators/inflation', {
                params: { period }
            });
            return response.data;
        } catch (error) {
            handleApiError(error, '물가 데이터를 가져오는데 실패했습니다.');
        }
    },

    // 고용 지표
    getEmployment: async (period = '1y') => {
        try {
            const response = await apiClient.get('/api/indicators/employment', {
                params: { period }
            });
            return response.data;
        } catch (error) {
            handleApiError(error, '고용 데이터를 가져오는데 실패했습니다.');
        }
    },

    // GDP 지표
    getGDP: async (period = '5y') => {
        try {
            const response = await apiClient.get('/api/indicators/gdp', {
                params: { period }
            });
            return response.data;
        } catch (error) {
            handleApiError(error, 'GDP 데이터를 가져오는데 실패했습니다.');
        }
    },

    // 경기선행지수
    getLeadingIndicators: async (period = '1y') => {
        try {
            const response = await apiClient.get('/api/indicators/leading', {
                params: { period }
            });
            return response.data;
        } catch (error) {
            handleApiError(error, '경기선행지수를 가져오는데 실패했습니다.');
        }
    },

    // 전체 요약
    getSummary: async () => {
        try {
            const response = await apiClient.get('/api/indicators/summary');
            return response.data;
        } catch (error) {
            handleApiError(error, '요약 데이터를 가져오는데 실패했습니다.');
        }
    }
};