@echo off
curl -s --head http://localhost:8083 | find "200" >nul
if %ERRORLEVEL% equ 0 (
    echo Test Passed
    exit /b 0
) else (
    echo Test Failed
    exit /b 1
)
