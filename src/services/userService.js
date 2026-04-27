function fetchUser() {
  return { name: "Real User" };
}

function getUserName() {
  const user = module.exports.fetchUser();
  return user.name;
}

module.exports = {
  fetchUser,
  getUserName,
};
