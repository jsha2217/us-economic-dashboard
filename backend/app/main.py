"""
FastAPI 메인 애플리케이션
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routes import indicators, analysis

settings = get_settings()

app = FastAPI(
    title="US Economic Dashboard API",
    description="미국 경제 지표 대시보드 - FRED API & AI 분석",
    version="1.0.0",
    debug=settings.debug,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS 미들웨어 - 프로덕션 환경 대응
allowed_origins = [
    "http://localhost:5173",  # 로컬 개발
    "http://localhost:3000",
    "https://*.netlify.app",  # Netlify 배포
    "https://*.vercel.app",   # Vercel (선택)
]

# 프로덕션에서는 환경 변수로 추가 가능
if not settings.debug:
    # 프로덕션 환경에서는 특정 도메인만 허용
    allowed_origins = [
        "https://us-economic-dashboard.netlify.app",  # 실제 도메인으로 변경
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발: 모든 origin, 프로덕션: allowed_origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(indicators.router)
app.include_router(analysis.router)


@app.get("/", tags=["Root"])
async def root():
    """루트 엔드포인트"""
    return {
        "message": "US Economic Dashboard API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """헬스 체크 엔드포인트"""
    return {
        "status": "healthy",
        "debug_mode": settings.debug
    }


@app.on_event("startup")
async def startup_event():
    """서버 시작 이벤트"""
    print("=" * 60)
    print("🚀 US Economic Dashboard API 서버 시작!")
    print(f"📊 Swagger UI: http://localhost:{settings.port}/docs")
    print(f"📄 ReDoc: http://localhost:{settings.port}/redoc")
    print(f"🔧 Debug Mode: {settings.debug}")
    print("=" * 60)


@app.on_event("shutdown")
async def shutdown_event():
    """서버 종료 이벤트"""
    print("\n" + "=" * 60)
    print("👋 US Economic Dashboard API 서버 종료 중...")
    print("=" * 60)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )