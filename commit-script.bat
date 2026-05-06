@echo off
cd /d "%~dp0"
git checkout -b add-all-files
git add -A
git commit -m "Add all project files"
git push -u origin add-all-files
echo Done!
pause