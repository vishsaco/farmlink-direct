@echo off
title FarmLink Direct - Backend Server
echo ===================================================
echo   Starting FarmLink Direct Django Backend (Port 8000)
echo ===================================================
cd backend
call .\venv\Scripts\activate
python manage.py runserver 0.0.0.0:8000
pause
