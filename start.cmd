@echo off
cd /d "%~dp0"
if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" (
  "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" start-server.py
  pause
  exit /b
)
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 start-server.py
  pause
  exit /b
)
where python >nul 2>nul
if %errorlevel%==0 (
  python start-server.py
  pause
  exit /b
)
echo Please install Python 3, then run start.cmd again.
pause
