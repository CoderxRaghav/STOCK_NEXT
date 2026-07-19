import yfinance as yf
import pandas as pd
import numpy as np

class DataFetchError(Exception):
    pass

import requests

def fetch_history(ticker: str, period: str = "1y") -> pd.DataFrame:
    """Fetch history, automatically trying .NS and .BO suffixes for Indian tickers."""
    candidates = [ticker]
    # If the ticker doesn't already have a suffix, also try NSE and BSE
    if "." not in ticker:
        candidates.append(f"{ticker}.NS")
        candidates.append(f"{ticker}.BO")

    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })

    last_error = None
    for t in candidates:
        try:
            stock = yf.Ticker(t, session=session)
            df = stock.history(period=period)
            if not df.empty:
                return df
        except Exception as e:
            last_error = e

    raise DataFetchError(
        f"No data returned for ticker '{ticker}' (tried: {', '.join(candidates)})"
    )

def compute_indicators(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    
    # Moving Averages
    df['MA100'] = df['Close'].rolling(window=100, min_periods=1).mean()
    df['MA200'] = df['Close'].rolling(window=200, min_periods=1).mean()
    
    # RSI (14-day) - Wilder's Smoothing
    delta = df['Close'].diff()
    gain = delta.where(delta > 0, 0).ewm(alpha=1/14, adjust=False).mean()
    loss = (-delta.where(delta < 0, 0)).ewm(alpha=1/14, adjust=False).mean()
    rs = gain / (loss + 1e-9)
    df['RSI'] = 100 - (100 / (1 + rs))
    
    # MACD
    ema12 = df['Close'].ewm(span=12, adjust=False).mean()
    ema26 = df['Close'].ewm(span=26, adjust=False).mean()
    df['MACD'] = ema12 - ema26
    df['MACD_signal'] = df['MACD'].ewm(span=9, adjust=False).mean()
    
    # Daily Volume Change %
    df['Volume_Change_Pct'] = df['Volume'].pct_change() * 100
    df['Volume_Change_Pct'] = df['Volume_Change_Pct'].fillna(0)
    
    # Handle NaNs from diff/initial rolling
    df = df.bfill().fillna(0)
    return df
