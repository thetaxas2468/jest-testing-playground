function getUser() {
  return {
    name: "Karam",
    age: 27,
  };
}

// it("user snapshot", () => {
//   const data = getUser();
//   expect(data).toMatchInlineSnapshot();
// });

it("user snapshot", () => {
  const data = getUser();
  expect(data).toMatchInlineSnapshot(`
{
  "age": 27,
  "name": "Karam",
}
`);
});

// it('will fail every time', () => {
//   const user = {
//     createdAt: new Date(),
//     id: Math.floor(Math.random() * 20),
//     name: 'LeBron James',
//   };

//   expect(user).toMatchSnapshot();
// });
it("will check the matchers and pass", () => {
  const user = {
    createdAt: new Date(),
    id: Math.floor(Math.random() * 20),
    name: "LeBron James",
  };

  expect(user).toMatchSnapshot({
    createdAt: expect.any(Date),
    id: expect.any(Number),
  });
});
