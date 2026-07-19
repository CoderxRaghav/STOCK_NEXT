import requests

def check_symbol(symbol):
    url = f"https://www.tradingview.com/symbols/{symbol}/"
    headers = {'User-Agent': 'Mozilla/5.0'}
    r = requests.get(url, headers=headers)
    print(f"{symbol}: {r.status_code}")

check_symbol("NSE-RELIANCE")
check_symbol("BSE-RELIANCE")
check_symbol("NSE-HDFCBANK")
check_symbol("BSE-HDFCBANK")
check_symbol("NSE-TCS")
check_symbol("BSE-TCS")
check_symbol("NSE-INFY")
check_symbol("BSE-INFY")
