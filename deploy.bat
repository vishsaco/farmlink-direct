@echo off
echo ========================================================
echo       FarmLink Direct - Cloud Deployment Helper
echo ========================================================
echo.
echo [1/2] Deploying Frontend to Vercel...
cd frontend
call npx vercel --prod
cd ..
echo.
echo ========================================================
echo [2/2] Backend Deployment on Render:
echo 1. Push repo to GitHub:
echo    git remote add origin https://github.com/YOUR_USERNAME/farmlink-direct.git
echo    git push -u origin main
echo.
echo 2. Go to https://dashboard.render.com/select-repo?type=blueprint
echo    Select this repository to deploy Django API using render.yaml
echo ========================================================
pause
