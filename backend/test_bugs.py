import sys
from app.main import predict_stock

ticker = sys.argv[1] if len(sys.argv) > 1 else "TSLA"
try:
    res = predict_stock(ticker)
    print(f"Ticker: {res.ticker}")
    print(f"Trend: {res.trend}")
    print(f"Confidence: {res.confidence}")
    print(f"Market Cap: {res.stats.marketCap}")
    for s in res.signals:
        print(f"Signal: {s.label} ({s.direction})")
except Exception as e:
    import traceback
    traceback.print_exc()
