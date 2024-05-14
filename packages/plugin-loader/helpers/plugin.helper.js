class Plugin {
  static pluginNumber = 0;
  static #VALID_ENFORCES = ["pre", "post"];
  static #DEFAULT_CONFIG = {
    enforce: "pre",
    dependOn: [],
    parallel: false,
    setup: (app) => app.mount("#app"),
  };
  static #CONFIG_VALIDATE_MAP = {
    name: (value) => !value || typeof value === "string",
    dependOn: (value) => {
      const isString = typeof value === "string";

      if (isString) return true;

      const isArray = Array.isArray(value);
      if (isArray) {
        const isValid = !value.some((dependencyName) => typeof dependencyName !== "string");
        return isValid;
      }

      return false;
    },
    enforce: (value) => {
      return Plugin.#VALID_ENFORCES.includes(value);
    },
    setup: (value) => typeof value === "function",
    parallel: () => true,
  };

  #normalizeName(name) {
    if (!name) {
      Plugin.pluginNumber++;
      return `plugin-${Plugin.pluginNumber}`;
    }

    return name;
  }

  #normalizeDependOn(dependOn) {
    if (Array.isArray(dependOn)) return dependOn;

    if (typeof dependOn === "string") return [dependOn];

    return [];
  }

  #validateConfig(config) {
    for (const [key, value] of Object.entries(config)) {
      const validateFn = Plugin.#CONFIG_VALIDATE_MAP[key];
      const isValid = validateFn?.(value);

      if (!isValid) {
        throw new Error(`${key} is not valid!`);
      }
    }
  }

  name;
  enforce;
  dependOn;
  parallel;
  setup;

  constructor(config) {
    this.#validateConfig(config);

    const { name, enforce, dependOn, parallel, setup } = { ...Plugin.#DEFAULT_CONFIG, ...config };

    this.name = this.#normalizeName(name);
    this.enforce = enforce;
    this.dependOn = this.#normalizeDependOn(dependOn);
    this.parallel = parallel;
    this.setup = setup;
  }
}

export default Plugin;
