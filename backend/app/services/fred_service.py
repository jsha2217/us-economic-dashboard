"""
FRED API 서비스
세인트루이스 연방준비은행의 경제 데이터
"""
import httpx
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from app.config import get_settings

settings = get_settings()


class FREDService:
    """
    FRED API와 통신하는 서비스 클래스
    """

    def __init__(self):
        self.base_url = settings.fred_base_url
        self.api_key = settings.fred_api_key
        # 비동기 HTTP 클라이언트 생성
        self.client = httpx.AsyncClient(timeout=30.0)

    async def close(self):
        """
        HTTP 클라이언트 종료
        """
        await self.client.aclose()

    async def get_series(
            self,
            series_id: str,
            start_date: Optional[str] = None,
            end_date: Optional[str] = None
    ) -> Dict:
        """
        단일 경제 지표 데이터를 가져옵니다.

        Args:
            series_id: FRED 시리즈 ID (예: 'DFF', 'CPIAUCSL')
            start_date: 시작 날짜 (YYYY-MM-DD)
            end_date: 종료 날짜 (YYYY-MM-DD)

        Returns:
            경제 지표 데이터
        """
        # 날짜가 없으면 기본값 설정 (최근 1년)
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")
        if not start_date:
            start_date = (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d")

        # API 엔드포인트
        url = f"{self.base_url}/series/observations"

        # 요청 파라미터
        params = {
            "series_id": series_id,
            "api_key": self.api_key,
            "file_type": "json",
            "observation_start": start_date,
            "observation_end": end_date,
            "sort_order": "desc"  # 최신 데이터부터
        }

        try:
            # API 호출
            response = await self.client.get(url, params=params)
            response.raise_for_status()  # 에러 발생 시 예외 처리

            data = response.json()

            # 데이터 가공
            observations = data.get("observations", [])

            # '.'은 데이터 없음을 의미하므로 필터링
            valid_observations = [
                {
                    "date": obs["date"],
                    "value": float(obs["value"])
                }
                for obs in observations
                if obs["value"] != "."
            ]

            return {
                "series_id": series_id,
                "data": valid_observations,
                "count": len(valid_observations),
                "start_date": start_date,
                "end_date": end_date
            }

        except httpx.HTTPStatusError as e:
            print(f"❌ HTTP 에러: {e.response.status_code} - {series_id}")
            return {
                "series_id": series_id,
                "data": [],
                "error": f"HTTP {e.response.status_code}"
            }
        except Exception as e:
            print(f"❌ 에러 발생: {str(e)} - {series_id}")
            return {
                "series_id": series_id,
                "data": [],
                "error": str(e)
            }

    async def get_multiple_series(
            self,
            series_ids: List[str],
            start_date: Optional[str] = None,
            end_date: Optional[str] = None
    ) -> Dict[str, Dict]:
        """
        여러 경제 지표를 한 번에 가져옵니다.

        Args:
            series_ids: FRED 시리즈 ID 리스트
            start_date: 시작 날짜
            end_date: 종료 날짜

        Returns:
            {series_id: data} 형태의 딕셔너리
        """
        results = {}

        # 각 시리즈를 순차적으로 가져오기
        for series_id in series_ids:
            print(f"📊 데이터 가져오는 중: {series_id}")
            data = await self.get_series(series_id, start_date, end_date)
            results[series_id] = data

        return results

    async def get_latest_value(self, series_id: str) -> Optional[Dict]:
        """
        특정 지표의 최신 값을 가져옵니다.

        Args:
            series_id: FRED 시리즈 ID

        Returns:
            최신 데이터 포인트
        """
        data = await self.get_series(series_id)

        if data.get("data"):
            latest = data["data"][0]  # sort_order='desc'이므로 첫 번째가 최신
            return {
                "series_id": series_id,
                "date": latest["date"],
                "value": latest["value"]
            }

        return None


# 서비스 인스턴스 생성 함수
def get_fred_service() -> FREDService:
    """
    FREDService 인스턴스를 반환합니다.
    """
    return FREDService()