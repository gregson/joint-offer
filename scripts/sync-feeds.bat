@echo off
cd /d C:\inetpub\wwwroot\jointoffer
echo Starting feed synchronization at %date% %time% >> sync-feeds.log
call npm run sync-feeds >> sync-feeds.log 2>&1
echo Finished feed synchronization at %date% %time% >> sync-feeds.log
echo -------------------------------------------- >> sync-feeds.log
