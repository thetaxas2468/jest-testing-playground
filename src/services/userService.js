const {request} = require("../manualMocks/request");

function fetchUser() {
  return { name: "Real User" };
}

function getUserName() {
  const user = module.exports.fetchUser();
  return user.name;
}

function byRequest(userID) {
  return request(`/users/${userID}`).then((user) => user.name);
}
module.exports = {
  fetchUser,
  getUserName,
  byRequest,
};
