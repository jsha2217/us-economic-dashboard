"""
경제 지표 API 라우터
FRED 데이터를 조회하는 엔드포인트들을 정의합니다.
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from datetime import datetime, timedelta
from app.services.fred_service import get_fred_service
from app.utils.constants import INDICATOR_CATEGORIES, ALL_INDICATORS

router = APIRouter(
    prefix="/api/indicators",
    tags=["Indicators"]
)


def get_date_range(period: str):
    """
    기간 문자열을 날짜 범위로 변환합니다.
    """
    period_days = {
        "1m": 30,
        "3m": 90,
        "6m": 180,
        "1y": 365,
        "3y": 365 * 3,
        "5y": 365 * 5
    }

    days = period_days.get(period, 365)
    end_date = datetime.now().strftime("%Y-%m-%d")
    start_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")

    return start_date, end_date


@router.get("/interest-rates")
async def get_interest_rates(
        period: str = Query("1y", description="기간: 1m, 3m, 6m, 1y, 3y, 5y")
):
    """
    금리 관련 지표를 가져옵니다.
    - Federal Funds Rate (기준금리)
    - 10-Year Treasury Rate
    - 2-Year Treasury Rate
    - 10Y-2Y Spread
    - 30-Year Mortgage Rate
    """
    fred_service = get_fred_service()

    try:
        start_date, end_date = get_date_range(period)

        # 금리 지표 가져오기
        series_ids = list(INDICATOR_CATEGORIES["interest_rates"].keys())
        data = await fred_service.get_multiple_series(
            series_ids,
            start_date,
            end_date
        )

        await fred_service.close()

        return {
            "category": "interest_rates",
            "period": period,
            "data": data,
            "metadata": {
                "start_date": start_date,
                "end_date": end_date,
                "source": "FRED"
            }
        }

    except Exception as e:
        await fred_service.close()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/inflation")
async def get_inflation(
        period: str = Query("1y", description="기간: 1m, 3m, 6m, 1y, 3y, 5y")
):
    """
    물가 지표를 가져옵니다.
    - Consumer Price Index (CPI)
    - Core CPI (식품/에너지 제외)
    - PCE Price Index
    - Core PCE
    """
    fred_service = get_fred_service()

    try:
        start_date, end_date = get_date_range(period)

        series_ids = list(INDICATOR_CATEGORIES["inflation"].keys())
        data = await fred_service.get_multiple_series(
            series_ids,
            start_date,
            end_date
        )

        await fred_service.close()

        return {
            "category": "inflation",
            "period": period,
            "data": data,
            "metadata": {
                "start_date": start_date,
                "end_date": end_date,
                "source": "FRED"
            }
        }

    except Exception as e:
        await fred_service.close()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/employment")
async def get_employment(
        period: str = Query("1y", description="기간: 1m, 3m, 6m, 1y, 3y, 5y")
):
    """
    고용 지표를 가져옵니다.
    - Unemployment Rate (실업률)
    - Nonfarm Payrolls (비농업 고용)
    - Initial Jobless Claims (신규 실업수당 청구)
    - Job Openings (구인)
    """
    fred_service = get_fred_service()

    try:
        start_date, end_date = get_date_range(period)

        series_ids = list(INDICATOR_CATEGORIES["employment"].keys())
        data = await fred_service.get_multiple_series(
            series_ids,
            start_date,
            end_date
        )

        await fred_service.close()

        return {
            "category": "employment",
            "period": period,
            "data": data,
            "metadata": {
                "start_date": start_date,
                "end_date": end_date,
                "source": "FRED"
            }
        }

    except Exception as e:
        await fred_service.close()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/gdp")
async def get_gdp(
        period: str = Query("5y", description="기간: 1m, 3m, 6m, 1y, 3y, 5y")
):
    """
    GDP 및 경제 성장 지표를 가져옵니다.
    - Gross Domestic Product (GDP)
    - Real GDP
    - Real GDP Growth Rate
    - Industrial Production Index
    """
    fred_service = get_fred_service()

    try:
        start_date, end_date = get_date_range(period)

        series_ids = list(INDICATOR_CATEGORIES["gdp"].keys())
        data = await fred_service.get_multiple_series(
            series_ids,
            start_date,
            end_date
        )

        await fred_service.close()

        return {
            "category": "gdp",
            "period": period,
            "data": data,
            "metadata": {
                "start_date": start_date,
                "end_date": end_date,
                "source": "FRED"
            }
        }

    except Exception as e:
        await fred_service.close()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/leading")
async def get_leading_indicators(
        period: str = Query("1y", description="기간: 1m, 3m, 6m, 1y, 3y, 5y")
):
    """
    경기선행지수를 가져옵니다.
    - Leading Index for US
    - Consumer Sentiment
    - New Housing Permits
    - Retail Sales
    """
    fred_service = get_fred_service()

    try:
        start_date, end_date = get_date_range(period)

        series_ids = list(INDICATOR_CATEGORIES["leading"].keys())
        data = await fred_service.get_multiple_series(
            series_ids,
            start_date,
            end_date
        )

        await fred_service.close()

        return {
            "category": "leading",
            "period": period,
            "data": data,
            "metadata": {
                "start_date": start_date,
                "end_date": end_date,
                "source": "FRED"
            }
        }

    except Exception as e:
        await fred_service.close()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary")
async def get_summary():
    """
    모든 주요 지표의 최신 값을 요약해서 보여줍니다.
    대시보드의 Quick Metrics용입니다.
    """
    fred_service = get_fred_service()

    try:
        summary = {}

        # 카테고리별로 최신 값 가져오기
        for category, indicators in INDICATOR_CATEGORIES.items():
            summary[category] = {}

            for series_id, name in indicators.items():
                print(f"📊 {series_id} 최신 값 가져오는 중...")
                latest = await fred_service.get_latest_value(series_id)
                if latest:
                    summary[category][series_id] = {
                        "name": name,
                        "value": latest["value"],
                        "date": latest["date"]
                    }

        await fred_service.close()

        return {
            "summary": summary,
            "updated_at": datetime.now().isoformat()
        }

    except Exception as e:
        await fred_service.close()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/test")
async def test_fred_api():
    """
    FRED API 연결 테스트 - 기준금리(DFF) 최신 값 가져오기
    """
    fred_service = get_fred_service()

    try:
        # 기준금리 최신 값 가져오기
        result = await fred_service.get_latest_value("DFF")
        await fred_service.close()

        if result:
            return {
                "status": "success",
                "message": "FRED API 연결 성공! ✅",
                "data": result
            }
        else:
            return {
                "status": "error",
                "message": "데이터를 가져올 수 없습니다."
            }

    except Exception as e:
        await fred_service.close()
        return {
            "status": "error",
            "message": f"에러 발생: {str(e)}"
        }