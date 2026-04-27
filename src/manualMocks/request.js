const users = {
  4: { name: "Mark" },
  5: { name: "Paul" },
};

function request(url) {
  return new Promise((resolve, reject) => {
    const userID = Number(url.split("/").pop());

    setTimeout(() => {
      console.log(`Requesting user with ID: ${userID}`);
      if (users[userID]) {
        resolve(users[userID]);
      } else {
        reject(new Error(`User with ${userID} not found.`));
      }
    }, 0);
  });
}

module.exports = { request };
