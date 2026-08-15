import { startConfiguredTelegramPolling } from "./polling";

// Starts only when server-side configuration explicitly enables polling.
// Secrets remain environment-managed and are never embedded in this entry.
startConfiguredTelegramPolling();
