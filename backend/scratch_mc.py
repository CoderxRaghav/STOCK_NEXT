import yfinance as yf
from app.main import format_market_cap, get_company_info
import math

def debug_ticker(ticker):
    print(f"\n--- {ticker} ---")
    info = yf.Ticker(ticker).info
    mc = info.get("marketCap")
    print("Raw marketCap:", mc, type(mc))
    
    if not mc or (isinstance(mc, float) and math.isnan(mc)):
        shares = info.get("sharesOutstanding")
        print("Raw sharesOutstanding:", shares, type(shares))
        mc = info.get("enterpriseValue")
        print("Raw enterpriseValue:", mc, type(mc))
        
    res = get_company_info(ticker)
    print("Final Stats Dictionary:")
    print(res)

debug_ticker("AAPL")
debug_ticker("HDFCBANK.NS")
