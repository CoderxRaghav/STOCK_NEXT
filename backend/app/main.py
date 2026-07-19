from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import math
import pandas as pd
from datetime import datetime
import yfinance as yf

from app.data import fetch_history, compute_indicators, DataFetchError
from app.model import predict_next, derive_trend, derive_change_pct, derive_signals

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HistoryPoint(BaseModel):
    date: str
    actual: Optional[float]
    predicted: Optional[float]
    ma100: float
    ma200: float

class SignalItem(BaseModel):
    label: str
    weight: float
    direction: str

class Stats(BaseModel):
    marketCap: str
    peRatio: float
    weekHigh52: float
    weekLow52: float
    avgVolume: str

class PredictResponse(BaseModel):
    ticker: str
    companyName: str
    currentPrice: float
    predictedPrice: float
    changePct: float
    trend: str
    confidence: int
    history: List[HistoryPoint]
    signals: List[SignalItem]
    stats: Stats
    lastUpdated: str

def format_volume(vol: float) -> str:
    if vol >= 1e6:
        return f"{vol/1e6:.1f}M"
    elif vol >= 1e3:
        return f"{vol/1e3:.1f}K"
    return str(int(vol))

def format_market_cap(mc: float, curr: str) -> str:
    if math.isnan(mc) or mc == 0:
        return "N/A"
    if curr == "₹" and mc >= 1e7:
        return f"{curr}{mc/1e7:.2f} Cr"
    if mc >= 1e12:
        return f"{curr}{mc/1e12:.1f}T"
    elif mc >= 1e9:
        return f"{curr}{mc/1e9:.1f}B"
    elif mc >= 1e6:
        return f"{curr}{mc/1e6:.1f}M"
    return f"{curr}{mc:.0f}"

def get_company_info(ticker: str, df: pd.DataFrame):
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
    except:
        info = {}
        
    name = info.get("shortName") or info.get("longName") or f"{ticker} Corp"
    curr = "₹" if ticker.endswith(".NS") or ticker.endswith(".BO") else "$"
    
    mc = info.get("marketCap", 0)
    pe = info.get("trailingPE", 0.0)
    high52 = info.get("fiftyTwoWeekHigh", 0.0)
    low52 = info.get("fiftyTwoWeekLow", 0.0)
    avg_vol = info.get("averageVolume", 0)
    
    if not high52 or math.isnan(high52):
        high52 = float(df['Close'].max())
    if not low52 or math.isnan(low52):
        low52 = float(df['Close'].min())
    if not avg_vol or math.isnan(avg_vol):
        avg_vol = float(df['Volume'].mean())
        
    return {
        "name": name,
        "marketCap": format_market_cap(mc, curr) if mc else "N/A",
        "peRatio": float(pe) if pe and not math.isnan(pe) else 15.0,
        "weekHigh52": float(high52),
        "weekLow52": float(low52),
        "avgVolume": format_volume(avg_vol)
    }

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/api/predict/{ticker}", response_model=PredictResponse)
def predict_stock(ticker: str):
    original_ticker = ticker.strip().upper()
    yf_ticker = original_ticker
    indian_tickers = {
        "TCS", "INFY", "RELIANCE", "HDFCBANK", "NIFTY 50",
        "SBIN", "ICICIBANK", "BAJFINANCE", "ZOMATO", "PAYTM", "GROWW"
    }
    if original_ticker in indian_tickers:
        yf_ticker = f"{original_ticker}.NS"
        
    try:
        df = fetch_history(yf_ticker, period="1y")
        df = compute_indicators(df)
        
        predicted_price, confidence = predict_next(yf_ticker, df)
        
        current_price = float(df.iloc[-1]['Close'])
        trend = derive_trend(current_price, predicted_price)
        change_pct = derive_change_pct(current_price, predicted_price)
        signals = derive_signals(df)
        
        hist_df = df.tail(90).copy()
        history_points = []
        for idx, row in hist_df.iterrows():
            history_points.append(HistoryPoint(
                date=idx.strftime("%Y-%m-%d"),
                actual=round(float(row['Close']), 2),
                predicted=None,
                ma100=round(float(row['MA100']), 2),
                ma200=round(float(row['MA200']), 2)
            ))
            
        next_day = (hist_df.index[-1] + pd.Timedelta(days=1))
        if next_day.weekday() >= 5:
            next_day += pd.Timedelta(days=(7 - next_day.weekday()))
            
        history_points.append(HistoryPoint(
            date=next_day.strftime("%Y-%m-%d"),
            actual=None,
            predicted=round(predicted_price, 2),
            ma100=round(float(hist_df.iloc[-1]['MA100']), 2),
            ma200=round(float(hist_df.iloc[-1]['MA200']), 2)
        ))
        
        info = get_company_info(yf_ticker, df)
        
        return PredictResponse(
            ticker=original_ticker,
            companyName=info["name"],
            currentPrice=round(current_price, 2),
            predictedPrice=round(predicted_price, 2),
            changePct=change_pct,
            trend=trend,
            confidence=confidence,
            history=history_points,
            signals=[SignalItem(**s) for s in signals],
            stats=Stats(
                marketCap=info["marketCap"],
                peRatio=round(info["peRatio"], 2),
                weekHigh52=round(info["weekHigh52"], 2),
                weekLow52=round(info["weekLow52"], 2),
                avgVolume=info["avgVolume"]
            ),
            lastUpdated=datetime.utcnow().isoformat() + "Z"
        )
        
    except DataFetchError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
