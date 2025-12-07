/**
 * API 서비스
 * 백엔드 FastAPI와 통신
 */
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    }
});

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

    // AI 분석 함수 추가
    generateAnalysis: async () => {
        try {
            const response = await apiClient.post('/api/analysis/generate');
            return response.data;
        } catch (error) {
            handleApiError(error, 'AI 분석을 생성하는데 실패했습니다.');
        }
    },

    testGemini: async () => {
        try {
            const response = await apiClient.get('/api/analysis/test');
            return response.data;
        } catch (error) {
            handleApiError(error, 'Gemini API 테스트 실패');
        }
    }
};