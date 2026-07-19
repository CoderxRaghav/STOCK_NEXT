import yfinance as yf

ticker = "HDFCBANK.NS"
stock = yf.Ticker(ticker)
info = stock.info

print(f"marketCap: {info.get('marketCap')}")
print(f"sharesOutstanding: {info.get('sharesOutstanding')}")
print(f"Keys in info: {list(info.keys())}")
