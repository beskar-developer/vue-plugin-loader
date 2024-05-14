import { Loader } from "../helpers";

export default {
  async install(app, options = {}) {
    const loader = new Loader({ app, ...options });

    await loader.load();
  },
};
