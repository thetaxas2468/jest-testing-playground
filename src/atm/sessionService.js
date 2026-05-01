// Manages ATM session timeouts.

function startSession(onExpire) {
  // Auto-logout the user after 30 seconds of inactivity
  setTimeout(() => {
    onExpire('SESSION_EXPIRED');
  }, 30_000);
}

function warnBeforeExpiry(onWarn) {
  // Warn the user 5 seconds before the session ends (at 25 seconds)
  setTimeout(() => {
    onWarn('WARNING: Session expiring soon');
  }, 25_000);
}

module.exports = { startSession, warnBeforeExpiry };
