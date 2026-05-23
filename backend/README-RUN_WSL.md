# Running Backend in WSL (Port 8081)

## Problem
The current backend uses `npm` and requires installing dependencies.
In some environments, Windows PowerShell blocks `npm` execution due to execution-policy.

## Recommended Fix
Run commands inside WSL *directly* (not via PowerShell). Ensure you are in WSL terminal.

## Steps
1. Open a WSL terminal (Ubuntu) in VSCode or separately.
2. Run:
   ```bash
   cd /home/danhacker/workouts/codealpha/e-comerce/production/CodeAlpha_e-commerce-store/backend
   npm install
   npm run dev
   ```
3. Test:
   - Health: `GET http://localhost:8081/health`

## Postman
Base URL: `http://localhost:8081`


