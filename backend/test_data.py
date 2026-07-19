import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from app.data import fetch_history, compute_indicators

def test():
    try:
        df = fetch_history("TCS.NS")
        df = compute_indicators(df)
        print(df[['Close', 'MA100', 'MA200', 'RSI', 'MACD', 'MACD_signal', 'Volume_Change_Pct']].tail(5))
        if df.tail(1).isnull().values.any():
            print("Failed: NaN in last row")
        else:
            print("Success: Indicators populated")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test()
