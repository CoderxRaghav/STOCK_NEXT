# Stock Trend Predictor - Backend

This is the backend for the Stock Trend Predictor. It's built with Python, FastAPI, and TensorFlow (Keras).

## Features
- Fetches real historical stock data via `yfinance`.
- Computes technical indicators (MA100, MA200, RSI, MACD, Volume Change %).
- Uses an LSTM neural network to predict the next day's closing price.
- Exposes a REST API that returns data formatted for the frontend.

## Local Setup

### Prerequisites
- Python 3.9+
- Virtual environment (recommended)

### Installation
1. Clone the repository and cd into `backend/`.
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `.\venv\Scripts\activate`
   - Unix/macOS: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`

### Running the App
Run the FastAPI application with Uvicorn:
```bash
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`. 
Check `http://localhost:8000/docs` for the interactive API documentation.

## Retraining a Model
The application automatically trains a model the first time a prediction is requested for a specific ticker if one does not already exist in `models/`.
To force a retrain, you can either:
1. Delete the specific `{ticker}.keras` and `{ticker}_scaler.pkl` files from the `models/` directory, and request a prediction again.
2. Call the `train()` function from `app/model.py` manually in a Python shell:
   ```python
   from app.model import train
   train("AAPL")
   ```

## Deployment
This backend is Dockerized and ready to be deployed on platforms like Render or Hugging Face Spaces.

1. Create a new Web Service on Render or a Docker Space on Hugging Face.
2. Connect this repository and set the root directory to `backend`.
3. The platform should automatically detect the `Dockerfile` and build the image.
4. Ensure the port is mapped correctly (default 8000).
5. Update the `allow_origins` in `app/main.py` if deploying the frontend to a specific URL (like Vercel).
