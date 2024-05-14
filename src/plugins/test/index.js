export default {
  name: "test",
  parallel: true,
  async setup() {
    await new Promise((resolve) => {
      setTimeout(() => {
        console.log("test added");
        resolve();
      }, 3000);
    });
  },
};
