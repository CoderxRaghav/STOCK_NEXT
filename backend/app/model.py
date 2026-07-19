import os
import pickle
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense

from app.data import fetch_history, compute_indicators

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

SEQ_LENGTH = 60

def _get_model_paths(ticker: str):
    return (
        os.path.join(MODELS_DIR, f"{ticker}.keras"),
        os.path.join(MODELS_DIR, f"{ticker}_scaler.pkl")
    )

def _prepare_data(df: pd.DataFrame):
    data = df.filter(['Close'])
    dataset = data.values
    training_data_len = int(np.ceil(len(dataset) * .95))
    
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(dataset)
    
    train_data = scaled_data[0:int(training_data_len), :]
    x_train, y_train = [], []
    
    for i in range(SEQ_LENGTH, len(train_data)):
        x_train.append(train_data[i-SEQ_LENGTH:i, 0])
        y_train.append(train_data[i, 0])
        
    x_train, y_train = np.array(x_train), np.array(y_train)
    x_train = np.reshape(x_train, (x_train.shape[0], x_train.shape[1], 1))
    
    return x_train, y_train, scaler, scaled_data, training_data_len, dataset

def train(ticker: str):
    df = fetch_history(ticker, period="2y") # longer period for training
    df = compute_indicators(df)
    
    if len(df) <= SEQ_LENGTH:
        raise ValueError(f"Not enough data to train {ticker}")
        
    x_train, y_train, scaler, _, _, _ = _prepare_data(df)
    
    model = Sequential([
        LSTM(50, return_sequences=True, input_shape=(x_train.shape[1], 1)),
        LSTM(50, return_sequences=False),
        Dense(25),
        Dense(1)
    ])
    
    model.compile(optimizer='adam', loss='mean_squared_error')
    model.fit(x_train, y_train, batch_size=16, epochs=5, verbose=0)
    
    model_path, scaler_path = _get_model_paths(ticker)
    # Use .keras instead of .h5 as per recent TensorFlow guidelines
    model.save(model_path)
    with open(scaler_path, 'wb') as f:
        pickle.dump(scaler, f)
        
    return model, scaler

_LOADED_MODELS = {}

def predict_next(ticker: str, df: pd.DataFrame):
    model_path, scaler_path = _get_model_paths(ticker)
    
    if ticker not in _LOADED_MODELS:
        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            model, scaler = train(ticker)
        else:
            model = load_model(model_path)
            with open(scaler_path, 'rb') as f:
                scaler = pickle.load(f)
        _LOADED_MODELS[ticker] = (model, scaler)
    else:
        model, scaler = _LOADED_MODELS[ticker]
            
    # Compute confidence based on recent validation error
    data = df.filter(['Close']).values
    if len(data) > SEQ_LENGTH:
        recent_data = data[-(SEQ_LENGTH + 10):]
        scaled_recent = scaler.transform(recent_data)
        
        # Calculate recent error
        X_val, y_val = [], []
        for i in range(SEQ_LENGTH, len(scaled_recent)):
            X_val.append(scaled_recent[i-SEQ_LENGTH:i, 0])
            y_val.append(scaled_recent[i, 0])
            
        X_val, y_val = np.array(X_val), np.array(y_val)
        X_val = np.reshape(X_val, (X_val.shape[0], X_val.shape[1], 1))
        
        preds = model.predict(X_val, verbose=0)
        mse = np.mean(np.square(preds - y_val))
        
        # Heuristic: smaller MSE -> higher confidence, capped at 100
        # E.g., MSE 0.001 -> conf ~90, MSE 0.01 -> conf ~50
        confidence = max(10, min(95, int(100 - (mse * 5000))))
    else:
        confidence = 50
        
    # Predict next day
    last_60_days = data[-SEQ_LENGTH:]
    last_60_days_scaled = scaler.transform(last_60_days)
    
    X_test = []
    X_test.append(last_60_days_scaled[:, 0])
    X_test = np.array(X_test)
    X_test = np.reshape(X_test, (X_test.shape[0], X_test.shape[1], 1))
    
    pred_price = model.predict(X_test, verbose=0)
    pred_price = scaler.inverse_transform(pred_price)
    predicted_price = float(pred_price[0][0])
    
    return predicted_price, confidence

def derive_trend(current: float, predicted: float) -> str:
    if predicted > current * 1.005:
        return "up"
    elif predicted < current * 0.995:
        return "down"
    return "flat"

def derive_change_pct(current: float, predicted: float) -> float:
    return float(round(((predicted - current) / current) * 100, 2))

def derive_signals(df: pd.DataFrame) -> list:
    last = df.iloc[-1]
    signals = []
    
    rsi = last['RSI']
    if rsi < 30:
        signals.append({"label": "RSI recovering from oversold", "weight": 0.85, "direction": "up"})
    elif rsi > 70:
        signals.append({"label": "RSI in overbought territory", "weight": 0.82, "direction": "down"})
        
    macd = last['MACD']
    signal = last['MACD_signal']
    if macd > signal:
        signals.append({"label": "MACD bullish crossover", "weight": 0.70, "direction": "up"})
    elif macd < signal:
        signals.append({"label": "MACD bearish crossover", "weight": 0.70, "direction": "down"})
        
    ma100 = last['MA100']
    ma200 = last['MA200']
    if ma100 > ma200:
        signals.append({"label": "MA100 above MA200", "weight": 0.65, "direction": "up"})
    elif ma100 < ma200:
        signals.append({"label": "MA100 below MA200", "weight": 0.65, "direction": "down"})
        
    vol_change = last['Volume_Change_Pct']
    if vol_change > 50:
        # Check direction based on close diff
        direction = "up" if last['Close'] > df.iloc[-2]['Close'] else "down"
        signals.append({"label": f"Volume spike vs avg", "weight": 0.60, "direction": direction})
        
    signals.sort(key=lambda x: x['weight'], reverse=True)
    
    if len(signals) == 0:
        signals.append({"label": "Neutral momentum", "weight": 0.50, "direction": "up"})
        
    return signals[:5]
