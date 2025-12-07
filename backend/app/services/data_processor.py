"""
데이터 프로세서
경제 지표 데이터를 가공 및 계산
"""
from typing import List, Dict
import pandas as pd


class DataProcessor:
    """
    경제 데이터 가공 클래스
    """

    @staticmethod
    def calculate_change(data: List[Dict]) -> Dict:
        """
        전월 대비 변화율을 계산합니다.

        Args:
            data: [{date, value}, ...] 형태의 데이터

        Returns:
            {
                "current": 현재 값,
                "previous": 이전 값,
                "change": 변화량,
                "change_percent": 변화율(%)
            }
        """
        if len(data) < 2:
            return None

        # 최신 두 개의 데이터 포인트
        current = data[0]["value"]
        previous = data[1]["value"]

        change = current - previous
        change_percent = (change / previous * 100) if previous != 0 else 0

        return {
            "current": current,
            "previous": previous,
            "change": round(change, 2),
            "change_percent": round(change_percent, 2),
            "date": data[0]["date"],
            "previous_date": data[1]["date"]
        }

    @staticmethod
    def calculate_yoy_change(data: List[Dict]) -> Dict:
        """
        전년 동기 대비 변화율을 계산합니다 (YoY: Year over Year).

        Args:
            data: [{date, value}, ...] 형태의 데이터

        Returns:
            YoY 변화 정보
        """
        if len(data) < 12:
            return None

        # 최신 값과 12개월 전 값
        current = data[0]["value"]
        year_ago = data[11]["value"] if len(data) > 11 else data[-1]["value"]

        change = current - year_ago
        change_percent = (change / year_ago * 100) if year_ago != 0 else 0

        return {
            "current": current,
            "year_ago": year_ago,
            "change": round(change, 2),
            "change_percent": round(change_percent, 2),
            "date": data[0]["date"],
            "year_ago_date": data[11]["date"] if len(data) > 11 else data[-1]["date"]
        }

    @staticmethod
    def calculate_moving_average(data: List[Dict], window: int = 3) -> List[Dict]:
        """
        이동평균을 계산합니다.

        Args:
            data: [{date, value}, ...] 형태의 데이터
            window: 이동평균 윈도우 크기

        Returns:
            이동평균이 추가된 데이터
        """
        if len(data) < window:
            return data

        # pandas DataFrame으로 변환
        df = pd.DataFrame(data)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')

        # 이동평균 계산
        df['ma'] = df['value'].rolling(window=window).mean()

        # 다시 딕셔너리 리스트로 변환
        result = []
        for _, row in df.iterrows():
            result.append({
                "date": row['date'].strftime("%Y-%m-%d"),
                "value": row['value'],
                "moving_average": round(row['ma'], 2) if pd.notna(row['ma']) else None
            })

        return result

    @staticmethod
    def get_trend(data: List[Dict], periods: int = 3) -> str:
        """
        최근 추세를 판단합니다.

        Args:
            data: [{date, value}, ...] 형태의 데이터
            periods: 판단할 기간 (데이터 포인트 개수)

        Returns:
            "increasing", "decreasing", "stable"
        """
        if len(data) < periods:
            return "unknown"

        recent_data = data[:periods]
        values = [d["value"] for d in recent_data]

        # 간단한 추세 판단
        increases = sum(1 for i in range(len(values) - 1) if values[i] > values[i + 1])
        decreases = sum(1 for i in range(len(values) - 1) if values[i] < values[i + 1])

        if increases > decreases:
            return "increasing"
        elif decreases > increases:
            return "decreasing"
        else:
            return "stable"

    @staticmethod
    def normalize_data(data: List[Dict]) -> List[Dict]:
        """
        데이터를 0-100 범위로 정규화합니다.
        차트 비교를 위해 사용합니다.

        Args:
            data: [{date, value}, ...] 형태의 데이터

        Returns:
            정규화된 데이터
        """
        values = [d["value"] for d in data]
        min_val = min(values)
        max_val = max(values)

        if max_val == min_val:
            return data

        result = []
        for d in data:
            normalized = ((d["value"] - min_val) / (max_val - min_val)) * 100
            result.append({
                "date": d["date"],
                "value": d["value"],
                "normalized": round(normalized, 2)
            })

        return result


def get_data_processor() -> DataProcessor:
    """
    DataProcessor 인스턴스를 반환합니다.
    """
    return DataProcessor()