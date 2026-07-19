import yfinance as yf

for t in ["AAPL", "HDFCBANK.NS"]:
    ticker = yf.Ticker(t)
    print(f"--- {t} ---")
    try:
        mc = ticker.fast_info['marketCap']
        print("fast_info['marketCap']:", mc)
    except Exception as e:
        print("Error getting fast_info marketCap:", e)
    
    try:
        shares = ticker.fast_info['shares']
        print("fast_info['shares']:", shares)
    except Exception as e:
        print("Error getting fast_info shares:", e)
