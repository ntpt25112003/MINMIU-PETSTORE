@echo off
echo ===================================================
echo   MinMiu Petstore - YOLOv8 Deep Learning Service
echo ===================================================
echo.
echo [*] Checking Python dependencies...
pip install -r requirements.txt

echo.
echo [*] Starting FastAPI YOLOv8 Microservice on port 8000...
uvicorn yolo_api:app --host 127.0.0.1 --port 8000 --reload
pause
