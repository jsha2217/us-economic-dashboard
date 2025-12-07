"""
Google Gemini AI 서비스
경제 지표를 분석하고 요약합니다.
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

        # 사용 가능한 모델 리스트 확인
        try:
            available_models = [m.name for m in genai.list_models()
                                if 'generateContent' in m.supported_generation_methods]
            print(f"🤖 사용 가능한 Gemini 모델 (generateContent 지원): {available_models[:5]}")
        except Exception as e:
            print(f"⚠️ 모델 리스트 확인 실패: {e}")
            available_models = []

        # 최신 모델 우선 순위로 시도
        model_options = [
            'models/gemini-2.5-flash',  # 최신 (로그에서 확인됨)
            'models/gemini-2.0-flash-exp',  # 실험 버전
            'models/gemini-2.0-flash',  # 2.0 버전
            'models/gemini-1.5-flash',  # 1.5 버전
            'models/gemini-1.5-pro',
            'models/gemini-pro',
            'gemini-2.5-flash',  # models/ 없는 버전도 시도
            'gemini-2.0-flash',
            'gemini-1.5-flash',
            'gemini-pro'
        ]

        self.model = None
        for model_name in model_options:
            try:
                print(f"🔍 모델 시도 중: {model_name}")
                self.model = genai.GenerativeModel(model_name)
                # 실제로 작동하는지 간단한 테스트
                test_response = self.model.generate_content("테스트")
                print(f"✅ 모델 로드 및 테스트 성공: {model_name}")
                break
            except Exception as e:
                print(f"❌ {model_name} 실패: {str(e)[:100]}")
                continue

        if self.model is None:
            raise Exception("사용 가능한 Gemini 모델을 찾을 수 없습니다.")

    def _prepare_economic_context(self, indicators: Dict) -> str:
        """
        경제 지표 데이터를 AI가 이해할 수 있는 형태로 변환
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
        """
        try:
            # 경제 데이터 준비
            context = self._prepare_economic_context(indicators)

            # AI 프롬프트 생성
            prompt = f"""당신은 경제 분석 전문가입니다. 다음 미국 경제 지표를 분석해주세요.

{context}

다음 형식으로 정확히 분석해주세요:

## 전체 요약
(2-3문장으로 전체 경제 상황 요약)

## 주요 포인트
- (포인트 1)
- (포인트 2)

## 향후 전망
(2-3문장으로 향후 전망 예측과 투자 조언)

한국어로 작성하되, 간결하고 이해하기 쉽게 설명해주세요."""

            # Gemini API 호출
            print("🤖 Gemini API 호출 중...")
            response = self.model.generate_content(prompt)

            # 응답 파싱
            analysis_text = response.text
            print(f"✅ AI 분석 생성 완료 (길이: {len(analysis_text)})")
            print(f"📄 원본 분석:\n{analysis_text}\n")

            # 간단한 파싱
            lines = analysis_text.strip().split('\n')

            summary = ""
            key_points = []
            outlook = ""

            current_section = None

            for line in lines:
                line = line.strip()
                if not line:
                    continue

                if '전체 요약' in line or '요약' in line or '1.' in line:
                    current_section = 'summary'
                    continue
                elif '주요 포인트' in line or '포인트' in line or '2.' in line:
                    current_section = 'points'
                    continue
                elif '전망' in line or 'outlook' in line.lower() or '3.' in line:
                    current_section = 'outlook'
                    continue

                # 번호나 불릿 제거
                clean_line = line.lstrip('0123456789.-•*# ')

                if current_section == 'summary' and clean_line:
                    summary += clean_line + " "
                elif current_section == 'points' and clean_line:
                    key_points.append(clean_line)
                elif current_section == 'outlook' and clean_line:
                    outlook += clean_line + " "

            return {
                "summary": summary.strip() or analysis_text[:300],
                "key_points": key_points if key_points else ["분석을 생성했습니다."],
                "outlook": outlook.strip() or "지속적인 모니터링이 필요합니다.",
                "raw_analysis": analysis_text
            }

        except Exception as e:
            print(f"❌ Gemini API 에러: {str(e)}")
            import traceback
            traceback.print_exc()
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