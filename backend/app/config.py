"""
애플리케이션 설정 관리
환경 변수를 로드하고 앱 전체에서 사용할 설정
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """
    앱 설정 클래스
    .env 파일에서 자동 환경 변수를 로드
    """
    # API Keys
    fred_api_key: str
    # anthropic_api_key: str
    gemini_api_key: str

    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True

    # Cache Settings
    cache_ttl: int = 3600  # 1시간 (초 단위)

    # FRED API 설정
    fred_base_url: str = "https://api.stlouisfed.org/fred"

    class Config:
        # .env 파일 경로 지정
        env_file = ".env"
        env_file_encoding = "utf-8"
        # 환경 변수 이름을 대소문자 구분 없이 사용
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """
    설정 객체를 반환
    @lru_cache로 한 번만 로드하고 재사용
    """
    return Settings()

# 사용 예시:
# from app.config import get_settings
# settings = get_settings()
# api_key = settings.fred_api_key