function Enum(...values) {
  const uniqueValues = values.reduce((acc, value) => {
    return { ...acc, [value]: Symbol(value) };
  }, {});

  const baseEnum = Object.freeze(uniqueValues);

  return new Proxy(baseEnum, {
    get(_, name) {
      const hasValue = name in baseEnum;
      if (!hasValue) {
        throw new Error(`"${name}" value does not exist in the enum`);
      }

      return baseEnum[name];
    },

    set() {
      throw new Error("Cannot add a new value to the enum");
    },
  });
}

export default Enum;
