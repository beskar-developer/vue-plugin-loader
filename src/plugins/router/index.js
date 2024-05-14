export default {
  name: "router",
  parallel: true,
  async setup() {
    await new Promise((resolve) => {
      setTimeout(() => {
        console.log("router added");
        resolve();
      }, 2000);
    });
  },
};
