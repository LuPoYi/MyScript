@echo off
setlocal enabledelayedexpansion

set "folder=F:\folder"

for %%a in ("%folder%\*") do (
    set "name=%%~na"
    set "ext=%%~xa"
    if "!name:HD_CH=!" == "!name!" if "!name:FHD_CH=!" == "!name!" (
        ren "%%a" "!name!_HD_CH!ext!"
    )
)