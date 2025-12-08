/**
 * API 서비스 모듈
 *
 * 백엔드 FastAPI 서버와 통신하는 함수들을 제공합니다.
 */

import axios from 'axios';

/**
 * 백엔드 API 기본 URL
 * 개발: localhost:8000
 * 프로덕션: Render 배포 URL (환경 변수)
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log('🌐 API Base URL:', API_BASE_URL);

/**
 * Axios 클라이언트 인스턴스
 */
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    }
});

/**
 * API 에러를 처리하는 헬퍼 함수
 */
const handleApiError = (error, defaultMessage) => {
    if (error.response) {
        console.error('API 에러:', error.response.data);
        throw new Error(error.response.data.detail || defaultMessage);
    } else if (error.request) {
        console.error('네트워크 에러:', error.request);
        throw new Error('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } else {
        console.error('요청 에러:', error.message);
        throw new Error(defaultMessage);
    }
};

export const api = {
    healthCheck: async () => {
        try {
            const response = await apiClient.get('/health');
            return response.data;
        } catch (error) {
            handleApiError(error, '헬스 체크 실패');
        }
    },

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

    getLeadingIndicators: async (period = '1y') => {
        try {
            const response = await apiClient.get('/api/indicators/leading', {
                params: { period }
            });
            return response.data;
        } catch (error) {
            handleApiError(error, '경기선행지수 데이터를 가져오는데 실패했습니다.');
        }
    },

    getSummary: async () => {
        try {
            const response = await apiClient.get('/api/indicators/summary');
            return response.data;
        } catch (error) {
            handleApiError(error, '요약 데이터를 가져오는데 실패했습니다.');
        }
    },

    generateAnalysis: async () => {
        try {
            const response = await apiClient.post('/api/analysis/generate');
            return response.data;
        } catch (error) {
            handleApiError(error, 'AI 분석을 생성하는데 실패했습니다.');
        }
    },
};