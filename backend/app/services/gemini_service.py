"""
Google Gemini AI 서비스
경제 지표를 분석 요약
"""
import google.generativeai as genai
from typing import Dict, List, Optional
from app.config import get_settings

settings = get_settings()


class GeminiService:
    """
    Google Gemini AI 서비스 클래스
    """

    def __init__(self):
        # Gemini API 설정
        genai.configure(api_key=settings.gemini_api_key)

        # 모델 초기화 (Gemini 1.5 Flash - 무료)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def _prepare_economic_context(self, indicators: Dict) -> str:
        """
        경제 지표 데이터를 AI가 이해할 수 있는 형태로 변환

        Args:
            indicators: 경제 지표 딕셔너리

        Returns:
            포맷된 문자열
        """
        context = "현재 미국 경제 지표:\n\n"

        # 금리
        if 'interest_rates' in indicators:
            context += "【금리】\n"
            for key, data in indicators['interest_rates'].items():
                context += f"- {data['name']}: {data['value']}% ({data['date']})\n"
            context += "\n"

        # 물가
        if 'inflation' in indicators:
            context += "【물가】\n"
            for key, data in indicators['inflation'].items():
                context += f"- {data['name']}: {data['value']} ({data['date']})\n"
            context += "\n"

        # 고용
        if 'employment' in indicators:
            context += "【고용】\n"
            for key, data in indicators['employment'].items():
                value_str = f"{data['value']}%" if key == 'UNRATE' else f"{data['value']:,}"
                context += f"- {data['name']}: {value_str} ({data['date']})\n"
            context += "\n"

        # GDP
        if 'gdp' in indicators:
            context += "【GDP 및 성장】\n"
            for key, data in indicators['gdp'].items():
                value_str = f"{data['value']}%" if 'Growth' in data['name'] else f"{data['value']:,}"
                context += f"- {data['name']}: {value_str} ({data['date']})\n"
            context += "\n"

        # 경기선행지수
        if 'leading' in indicators:
            context += "【경기선행지수】\n"
            for key, data in indicators['leading'].items():
                context += f"- {data['name']}: {data['value']} ({data['date']})\n"
            context += "\n"

        return context

    async def analyze_economy(self, indicators: Dict) -> Dict:
        """
        경제 상황을 종합 분석합니다.

        Args:
            indicators: 경제 지표 딕셔너리

        Returns:
            {
                "summary": "전체 요약",
                "key_points": ["주요 포인트1", "주요 포인트2", ...],
                "outlook": "전망"
            }
        """
        try:
            # 경제 데이터 준비
            context = self._prepare_economic_context(indicators)

            # AI 프롬프트 생성
            prompt = f"""당신은 경제 분석 전문가입니다. 다음 미국 경제 지표를 분석해주세요.

{context}

다음 형식으로 분석해주세요:

1. 전체 요약 (2-3문장)
2. 주요 포인트 (3-5개, 각각 한 문장)
3. 향후 전망 (2-3문장)

한국어로 작성하되, 전문적이면서도 이해하기 쉽게 설명해주세요.
경제 용어는 필요시 간단히 설명을 덧붙여주세요."""

            # Gemini API 호출
            response = self.model.generate_content(prompt)

            # 응답 파싱
            analysis_text = response.text

            # 간단한 파싱 (실제로는 더 정교하게 파싱 가능)
            lines = analysis_text.strip().split('\n')

            summary = ""
            key_points = []
            outlook = ""

            current_section = None

            for line in lines:
                line = line.strip()
                if not line:
                    continue

                if '전체 요약' in line or '요약' in line:
                    current_section = 'summary'
                    continue
                elif '주요 포인트' in line or '포인트' in line:
                    current_section = 'points'
                    continue
                elif '전망' in line or 'outlook' in line.lower():
                    current_section = 'outlook'
                    continue

                # 번호나 불릿 제거
                clean_line = line.lstrip('0123456789.-•* ')

                if current_section == 'summary' and clean_line:
                    summary += clean_line + " "
                elif current_section == 'points' and clean_line:
                    key_points.append(clean_line)
                elif current_section == 'outlook' and clean_line:
                    outlook += clean_line + " "

            return {
                "summary": summary.strip() or analysis_text[:200],
                "key_points": key_points if key_points else ["분석을 생성했습니다."],
                "outlook": outlook.strip() or "지속적인 모니터링이 필요합니다.",
                "raw_analysis": analysis_text
            }

        except Exception as e:
            print(f"❌ Gemini API 에러: {str(e)}")
            return {
                "summary": "AI 분석을 생성하는 중 오류가 발생했습니다.",
                "key_points": ["현재 경제 지표를 확인 중입니다."],
                "outlook": "데이터를 다시 확인해주세요.",
                "error": str(e)
            }

    async def generate_quick_insight(self, indicator_name: str, current_value: float,
                                     previous_value: Optional[float] = None) -> str:
        """
        특정 지표에 대한 간단한 인사이트 생성

        Args:
            indicator_name: 지표 이름
            current_value: 현재 값
            previous_value: 이전 값 (선택)

        Returns:
            인사이트 문자열
        """
        try:
            change_text = ""
            if previous_value is not None:
                change = current_value - previous_value
                change_text = f"이전 {previous_value}에서 {change:+.2f} 변화했습니다."

            prompt = f"""{indicator_name}가 현재 {current_value}입니다. {change_text}
이것이 경제에 어떤 의미인지 한 문장으로 간단히 설명해주세요."""

            response = self.model.generate_content(prompt)
            return response.text.strip()

        except Exception as e:
            print(f"❌ Gemini API 에러: {str(e)}")
            return f"{indicator_name}: {current_value}"


def get_gemini_service() -> GeminiService:
    """
    GeminiService 인스턴스를 반환합니다.
    """
    return GeminiService()