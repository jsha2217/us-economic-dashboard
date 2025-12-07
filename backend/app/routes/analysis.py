"""
AI 분석 API 라우터
Gemini를 사용한 경제 분석 엔드포인트
"""
from fastapi import APIRouter, HTTPException
from app.services.gemini_service import get_gemini_service
from app.services.fred_service import get_fred_service
from app.utils.constants import INDICATOR_CATEGORIES

router = APIRouter(
    prefix="/api/analysis",
    tags=["AI Analysis"]
)


@router.post("/generate")
async def generate_analysis():
    """
    현재 경제 상황에 대한 AI 분석을 생성합니다.
    """
    gemini_service = get_gemini_service()
    fred_service = get_fred_service()

    try:
        # 최신 경제 지표 수집
        indicators = {}

        for category, series_dict in INDICATOR_CATEGORIES.items():
            indicators[category] = {}

            for series_id, name in series_dict.items():
                print(f"📊 {series_id} 최신 값 가져오는 중...")
                latest = await fred_service.get_latest_value(series_id)

                if latest:
                    indicators[category][series_id] = {
                        "name": name,
                        "value": latest["value"],
                        "date": latest["date"]
                    }

        await fred_service.close()

        # AI 분석 생성
        print("🤖 Gemini AI 분석 생성 중...")
        analysis = await gemini_service.analyze_economy(indicators)

        return {
            "analysis": analysis,
            "indicators_used": indicators,
            "model": "Google Gemini 1.5 Flash"
        }

    except Exception as e:
        await fred_service.close()
        print(f"❌ 분석 생성 에러: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/test")
async def test_gemini():
    """
    Gemini API 연결 테스트
    """
    gemini_service = get_gemini_service()

    try:
        # 간단한 테스트
        test_indicators = {
            "interest_rates": {
                "DFF": {
                    "name": "Federal Funds Rate",
                    "value": 5.5,
                    "date": "2024-12-01"
                }
            }
        }

        analysis = await gemini_service.analyze_economy(test_indicators)

        return {
            "status": "success",
            "message": "Gemini API 연결 성공! ✅",
            "test_analysis": analysis
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"Gemini API 연결 실패: {str(e)}"
        }