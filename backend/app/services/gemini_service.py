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

            # 👇 2개 섹션만 요청
            prompt = f"""당신은 경제 분석 전문가입니다. 다음 미국 경제 지표를 분석해주세요.

    {context}

    다음 2가지만 간결하게 작성해주세요:

    ## 전체 요약
    (현재 미국 경제 상황을 2-3문장으로 요약)

    ## 미국 증시 투자 전망
    (S&P500, 나스닥 등 미국 증시 투자 전망을 2-3문장으로 제시)

    한국어로 작성하되, 전문적이면서도 이해하기 쉽게 설명해주세요."""

            # Gemini API 호출
            print("🤖 Gemini API 호출 중...")
            response = self.model.generate_content(prompt)

            # 응답 파싱
            analysis_text = response.text
            print(f"✅ AI 분석 생성 완료 (길이: {len(analysis_text)})")

            # 👇 2개 섹션 파싱
            lines = analysis_text.strip().split('\n')

            summary = ""
            outlook = ""
            current_section = None

            for line in lines:
                line = line.strip()
                if not line:
                    continue

                # 섹션 헤더 감지
                if '전체 요약' in line or line.startswith('## 전체 요약'):
                    current_section = 'summary'
                    continue
                elif '미국 증시' in line or '투자 전망' in line or line.startswith('## 미국'):
                    current_section = 'outlook'
                    continue

                # 내용 저장 (**, # 제거)
                clean_line = line.replace('**', '').replace('#', '').strip()

                if not clean_line:
                    continue

                if current_section == 'summary':
                    summary += clean_line + " "
                elif current_section == 'outlook':
                    outlook += clean_line + " "

            # 결과 정리
            summary = summary.strip()
            outlook = outlook.strip()

            # Fallback
            if not summary:
                summary = "미국 경제는 현재 안정적인 상황을 유지하고 있습니다."

            if not outlook:
                outlook = "시장 상황을 지속적으로 모니터링하는 것이 중요합니다."

            print(f"📊 파싱 결과:")
            print(f"   전체 요약: {len(summary)} 글자")
            print(f"   투자 전망: {len(outlook)} 글자")

            return {
                "summary": summary,
                "outlook": outlook,
                "raw_analysis": analysis_text
            }

        except Exception as e:
            print(f"❌ Gemini API 에러: {str(e)}")
            import traceback
            traceback.print_exc()
            return {
                "summary": "AI 분석을 생성하는 중 오류가 발생했습니다.",
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