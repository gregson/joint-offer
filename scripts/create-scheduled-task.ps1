$action = New-ScheduledTaskAction `
    -Execute "C:\inetpub\wwwroot\jointoffer\scripts\sync-feeds.bat"

$trigger = New-ScheduledTaskTrigger `
    -Daily `
    -At 4AM

$principal = New-ScheduledTaskPrincipal `
    -UserId "SYSTEM" `
    -LogonType ServiceAccount `
    -RunLevel Highest

$settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1) `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1)

Register-ScheduledTask `
    -TaskName "JointOffer-FeedSync" `
    -Action $action `
    -Trigger $trigger `
    -Principal $principal `
    -Settings $settings `
    -Description "Synchronise les données des smartphones depuis les différents fournisseurs"
