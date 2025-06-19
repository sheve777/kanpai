@echo off
REM ========================================
REM kanpAI Deployment Configuration Example
REM ========================================
REM Copy this file to deploy-config.bat and update with your actual values

REM Ubuntu Server Configuration
set SERVER_USER=ubuntu
set SERVER_IP=133.125.41.193
set SERVER_PATH=/home/ubuntu/kanpAI
set SSH_KEY_PATH=C:\Users\acmsh\.ssh\id_rsa

REM Optional: PM2 app names (if different from default)
set PM2_BACKEND_NAME=kanpai-backend
set PM2_FRONTEND_NAME=kanpai-frontend
set PM2_ADMIN_NAME=kanpai-admin