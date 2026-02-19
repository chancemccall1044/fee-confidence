# Fee Confidence — Deployment Model

## Hosting
Netlify

## CI/CD
- Git-connected deploy
- Production branch: `main`
- Build command: `npm run build`
- Publish directory: `dist`

## Versioning
- Version sourced from `package.json`
- Injected via Vite `define` → `__APP_VERSION__`
- Displayed in header badge
- Release tags follow semantic versioning (`vX.Y.Z`)

## Deployment Process
1. Update `package.json` version
2. Commit
3. Push to `main`
4. Netlify auto-builds and publishes
