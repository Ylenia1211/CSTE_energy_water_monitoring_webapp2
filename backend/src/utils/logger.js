function logWarn(message) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
}

function logError(message, error) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
}

module.exports = { logWarn, logError };
