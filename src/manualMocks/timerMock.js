function timerGame(callback) {
  setTimeout(() => {
    if (callback) {
        callback();
    }
  }, 1000);
}

module.exports = timerGame;
