import { DependencyResolver } from "../libs";
import Plugin from "./plugin.helper.js";

class Loader {
  app;
  ignore;
  mount;

  #normalizeIgnore(ignore) {
    if (Array.isArray(ignore)) return ignore;

    if (typeof ignore === "string") return [ignore];

    return [];
  }

  constructor({ app, ignore = [], mount = (app) => app.mount("#app") }) {
    this.app = app;
    this.ignore = this.#normalizeIgnore(ignore);
    this.mount = mount;
  }

  #getPlugins() {
    const pluginConfigs = import.meta.glob(`@/plugins/*/index.js`, {
      eager: true,
      import: "default",
    });

    const plugins = Object.values(pluginConfigs).map((config) => new Plugin(config));

    return plugins.filter((plugin) => !this.ignore.includes(plugin.name));
  }

  #dividePluginsByEnforce(plugins) {
    const prePlugins = [];
    const postPlugins = [];

    for (const plugin of plugins) {
      if (plugin.enforce === "pre") prePlugins.push(plugin);
      else postPlugins.push(plugin);
    }

    return { prePlugins, postPlugins };
  }

  #getPluginNames(prePlugins, postPlugins) {
    const prePluginNames = prePlugins.map(({ name }) => name);
    const postPluginNames = postPlugins.map(({ name }) => name);
    const pluginNames = [...postPluginNames, ...prePluginNames];

    return { prePluginNames, postPluginNames, pluginNames };
  }

  #throwValidationError({
    pluginName,
    dependOnName,
    isNameValid = true,
    isDependOnOpposite = false,
    isSameName = false,
  }) {
    if (!isNameValid) {
      throw new Error(`${dependOnName} is in dependOn of ${pluginName} but such a plugin does not exist`);
    }

    if (isDependOnOpposite) {
      throw new Error(`${dependOnName} is in dependOn of ${pluginName} but their enforces are not the same`);
    }

    if (isSameName) {
      throw new Error(
        `${dependOnName} is in dependOn of ${pluginName} but a plugin can not depend on itself`,
      );
    }
  }

  #validateDependOn({ plugin, pluginNames, oppositePluginNames }) {
    const { dependOn, name: pluginName } = plugin;

    for (const name of dependOn) {
      const isNameValid = pluginNames.includes(name);
      const isDependOnOpposite = oppositePluginNames.includes(name);
      const isSameName = pluginName === name;

      this.#throwValidationError({
        pluginName,
        dependOnName: name,
        isNameValid,
        isDependOnOpposite,
        isSameName,
      });
    }
  }

  #validatePlugins(prePlugins, postPlugins) {
    const { prePluginNames, postPluginNames, pluginNames } = this.#getPluginNames(prePlugins, postPlugins);

    for (const plugin of prePlugins) {
      this.#validateDependOn({ plugin, pluginNames, oppositePluginNames: postPluginNames });
    }

    for (const plugin of postPlugins) {
      this.#validateDependOn({ plugin, pluginNames, oppositePluginNames: prePluginNames });
    }
  }

  async #setupPlugin(dependencyResolver, plugin) {
    await plugin.setup(this.app);

    dependencyResolver.resolve(plugin.name);
  }

  async #resolvePlugins(dependencyResolver) {
    const plugin = dependencyResolver.get();

    if (dependencyResolver.isAllResolved() || !plugin) return;

    if (plugin.parallel) {
      await this.#setupPlugin(dependencyResolver, plugin);
      await this.#resolvePlugins(dependencyResolver);

      return;
    }

    dependencyResolver.lock();
    await this.#setupPlugin(dependencyResolver, plugin);
    dependencyResolver.unLock();

    await this.#resolvePlugins(dependencyResolver);
  }

  async load() {
    const plugins = this.#getPlugins();

    const { prePlugins, postPlugins } = this.#dividePluginsByEnforce(plugins);

    this.#validatePlugins(prePlugins, postPlugins);

    const preDependencyResolver = new DependencyResolver(prePlugins);
    await this.#resolvePlugins(preDependencyResolver);

    await this.mount(this.app);

    const postDependencyResolver = new DependencyResolver(postPlugins);
    await this.#resolvePlugins(postDependencyResolver);
  }
}

export default Loader;
