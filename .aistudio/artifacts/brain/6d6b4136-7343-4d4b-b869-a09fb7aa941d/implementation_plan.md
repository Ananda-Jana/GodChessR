# Implementation Plan: Fix Deployment Stalling & Stale Content

The issue is that the application is not correctly transitioning to the production deployment state when published in Gemini AI Studio. The "stuck" deployment occurs because the server container, when booting in production, does not successfully pass health checks, likely due to an environment configuration mismatch. Furthermore, the stale site content suggests that the production server might be serving cached files or an older `dist/` directory that wasn't correctly replaced.

### Proposed Changes

1.  **Robust Environment Detection**:
    -   In `server.ts`, we will modify the production mode detection logic. Instead of relying solely on `process.env.NODE_ENV`, we will prioritize checking for the existence of the `dist/` directory on the server startup to determine if we should serve static assets.

2.  **Port Handling Optimization**:
    -   Simplify port resolution to strictly use `process.env.PORT` if available, ensuring compatibility with the container infrastructure's requirements.

3.  **Build Lifecycle Improvement**:
    -   Update `package.json` to ensure the `dist/` directory is cleared before the build runs, ensuring that every deployment uses a fresh set of assets.

4.  **WebSocket Error Clarification**:
    -   The `WebSocket closed without opened` error is a harmless client-side issue specific to Vite's development HMR (Hot Module Replacement) and is unrelated to the publication stall. We will ignore this for production stability.

### Verification
-   After applying these changes, I will re-run the production test environment to confirm it serves the updated content immediately and passes health checks.
