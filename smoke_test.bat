@echo off
SET PORT=%1

IF "%PORT%"=="" (
    echo Error: No port specified
    echo Usage: smoke_test.bat [PORT]
    exit /b 1
)

echo Testing http://localhost:%PORT%...
curl -s --head http://localhost:%PORT% | find "200" >nul
if %ERRORLEVEL% equ 0 (
    echo ✅ Test Passed on port %PORT%
    exit /b 0
) else (
    echo ❌ Test Failed on port %PORT%
    exit /b 1
)
