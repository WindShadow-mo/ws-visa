@echo off
chcp 65001 >nul

REM 获取脚本所在目录
set "SCRIPT_DIR=%~dp0"
REM 项目根目录（脚本在 scripts 下，往上一级）
set "PROJECT_ROOT=%SCRIPT_DIR%..\"
REM .deploy 目录
set "DEPLOY_DIR=%PROJECT_ROOT%.deploy"
REM dist 目录
set "DIST_DIR=%PROJECT_ROOT%dist"

echo [1/5] 清空 .deploy 目录...
if not exist "%DEPLOY_DIR%" mkdir "%DEPLOY_DIR%"
cd /d "%DEPLOY_DIR%"
REM 删除目录下所有文件和子目录（保留 .git）
for /f "delims=" %%i in ('dir /b /a-d ^| findstr /v /i "^\.git$"') do del /f /q "%%i" 2>nul
for /f "delims=" %%i in ('dir /b /ad ^| findstr /v /i "^\.git$"') do rd /s /q "%%i" 2>nul

REM GitHub Pages 默认使用 Jekyll 构建静态站点。Jekyll 会自动忽略所有以下划线 _ 开头的文件和目录
echo [2/5] 复制 dist 文件到 .deploy...
xcopy /e /y /q "%DIST_DIR%\*" "%DEPLOY_DIR%\"

echo      创建 .nojekyll（防止 GitHub Pages 忽略 _ 开头的文件）...
type nul > "%DEPLOY_DIR%\.nojekyll"

echo [3/5] 检查 git 仓库...
cd /d "%DEPLOY_DIR%"

REM 检查是否为 git 仓库
if not exist ".git" (
    echo [错误] .deploy 不是一个 git 仓库，请先执行 git init
    pause
    exit /b 1
)

REM 检查远程地址
set "EXPECTED_URL=git@github.com:WindShadow-mo/ws-visa.git"
for /f "delims=" %%u in ('git remote get-url origin 2^>nul') do set "REMOTE_URL=%%u"

if "%REMOTE_URL%"=="" (
    echo [错误] .deploy 没有配置远程地址 origin
    echo        期望: %EXPECTED_URL%
    pause
    exit /b 1
)

if not "%REMOTE_URL%"=="%EXPECTED_URL%" (
    echo [错误] .deploy 的远程地址不匹配
    echo        当前: %REMOTE_URL%
    echo        期望: %EXPECTED_URL%
    pause
    exit /b 1
)

echo [4/5] Git add 并 commit...
git add -A

REM 获取当前时间 yyyy-MM-dd HH:mm:ss
for /f "tokens=2 delims==" %%i in ('wmic os get localdatetime /value') do set "dt=%%i"
set "TIMESTAMP=%dt:~0,4%-%dt:~4,2%-%dt:~6,2% %dt:~8,2%:%dt:~10,2%:%dt:~12,2%"

git commit -m "build:%TIMESTAMP%"

echo [5/5] 强制推送到 origin...
git push origin HEAD --force

echo 部署完成！