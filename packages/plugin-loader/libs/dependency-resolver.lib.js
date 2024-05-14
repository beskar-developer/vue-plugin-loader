import { Enum } from "../utils";

const State = new Enum("resolved", "pending", "unResolved");

class DependencyNode {
  #state;
  dependOn;
  name;
  instance;

  constructor(name, dependOn, instance) {
    this.name = name;
    this.dependOn = new Set(dependOn);
    this.instance = instance;
    this.#state = State.unResolved;
  }

  get state() {
    return this.#state;
  }

  pend() {
    this.#state = State.pending;
  }

  resolve() {
    this.#state = State.resolved;
  }
}

class DependencyResolver {
  isLocked = false;
  dependencies;

  parseDependencies(dependencies) {
    const parsedDependencies = dependencies.reduce(
      (acc, instance) => ({
        ...acc,
        [instance.name]: new DependencyNode(instance.name, instance.dependOn, instance),
      }),
      {},
    );

    return parsedDependencies;
  }

  constructor(dependencies = []) {
    this.dependencies = this.parseDependencies(dependencies);
  }

  #findIndependent() {
    const independent = Object.values(this.dependencies).find((dependency) => {
      const isPending = dependency.state === State.pending;
      const hasDependOn = dependency.dependOn.size !== 0;

      return !hasDependOn && !isPending;
    });

    return independent;
  }

  get() {
    if (this.isLocked) return null;

    const independent = this.#findIndependent();
    if (independent) {
      independent.pend();

      return independent.instance;
    }

    return null;
  }

  resolve(name) {
    this.dependencies = Object.fromEntries(
      Object.entries(this.dependencies).filter(([dependencyName]) => dependencyName !== name),
    );

    for (const dependencyName in this.dependencies) {
      this.dependencies[dependencyName].dependOn.delete(name);
    }
  }

  isAllResolved() {
    return !Object.keys(this.dependencies).length;
  }

  lock() {
    this.isLocked = true;
  }

  unLock() {
    this.isLocked = false;
  }
}

export default DependencyResolver;
