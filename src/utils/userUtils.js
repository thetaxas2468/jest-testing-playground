function processUser(callback) {
  return callback("Karam");
}

function getUser() {
  // Change this will fail the snapshot test, you can update the snapshot if the change is intentional
  //jest --updateSnapshot if you want to update the snapshot
  return {
    name: "Karam",
    age: 27
  };
}

module.exports = {
  processUser,
  getUser,
};