"""
경제 지표 상수 정의
FRED API에서 사용할 시리즈 ID 정의
"""

# 금리 관련 지표
INTEREST_RATES = {
    "DFF": "Federal Funds Rate",
    "DGS10": "10-Year Treasury Rate",
    "DGS2": "2-Year Treasury Rate",
    "T10Y2Y": "10Y-2Y Treasury Spread",
    "MORTGAGE30US": "30-Year Mortgage Rate"
}

# 경기선행지수
LEADING_INDICATORS = {
    "USSLIND": "Leading Index for US",
    "UMCSENT": "Consumer Sentiment",
    "PERMIT": "New Housing Permits",
    "RETAILSMNSA": "Retail Sales"
}

# 물가 지표
INFLATION = {
    "CPIAUCSL": "Consumer Price Index",
    "CPILFESL": "Core CPI",
    "PCEPI": "PCE Price Index",
    "PCEPILFE": "Core PCE"
}

# 고용 지표
EMPLOYMENT = {
    "UNRATE": "Unemployment Rate",
    "PAYEMS": "Nonfarm Payrolls",
    "ICSA": "Initial Jobless Claims",
    "JTSJOL": "Job Openings"
}

# GDP 및 성장
GDP_GROWTH = {
    "GDP": "Gross Domestic Product",
    "GDPC1": "Real GDP",
    "A191RL1Q225SBEA": "Real GDP Growth Rate",
    "INDPRO": "Industrial Production"
}

# 모든 지표를 하나의 딕셔너리로
ALL_INDICATORS = {
    **INTEREST_RATES,
    **LEADING_INDICATORS,
    **INFLATION,
    **EMPLOYMENT,
    **GDP_GROWTH
}

# 카테고리별 그룹
INDICATOR_CATEGORIES = {
    "interest_rates": INTEREST_RATES,
    "leading": LEADING_INDICATORS,
    "inflation": INFLATION,
    "employment": EMPLOYMENT,
    "gdp": GDP_GROWTH
}