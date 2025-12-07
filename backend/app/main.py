"""
FastAPI 메인 애플리케이션
API 서버의 진입점
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routes import indicators
from app.routes import indicators, analysis

# 설정 로드
settings = get_settings()

# FastAPI 앱 생성
app = FastAPI(
    title="US Economic Dashboard API",
    description="미국 경제 지표 대시보드 - FRED API & AI 분석",
    version="1.0.0",
    debug=settings.debug
)

# CORS 설정 (프론트엔드에서 API 호출 가능하도록)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 중에는 모든 origin 허용
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메소드 허용
    allow_headers=["*"],  # 모든 헤더 허용
)

# 라우터 등록
app.include_router(indicators.router)
app.include_router(analysis.router)

@app.get("/")
async def root():
    """
    루트 엔드포인트 - API 작동 확인용
    """
    return {
        "message": "US Economic Dashboard API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """
    헬스 체크 엔드포인트
    서버가 정상 작동하는지 확인합니다.
    """
    return {
        "status": "healthy",
        "debug_mode": settings.debug
    }


# 앱이 시작될 때 실행
@app.on_event("startup")
async def startup_event():
    """
    서버 시작 시 실행되는 함수
    """
    print("🚀 US Economic Dashboard API 서버 시작!")
    print(f"📊 문서 확인: http://localhost:{settings.port}/docs")


# 앱이 종료될 때 실행
@app.on_event("shutdown")
async def shutdown_event():
    """
    서버 종료 시 실행되는 함수
    """
    print("👋 서버 종료 중...")


# 개발 서버 실행 (터미널에서 python main.py 했을 때)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True  # 코드 변경 시 자동 재시작
    )