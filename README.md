# Plugin Loader

A powerful and flexible plugin loader inspired by Nuxt.js, designed to seamlessly integrate plugins into your Vue.js application.

## how to use

```javascript
import { pluginLoader } from "@packages/plugin-loader";
app.use(pluginLoader, options);
```

## options

```javascript
const options = {
  /* Array of plugin-names to ignore
   a single name is acceptable by string format*/
  ignore: Array | String,
  // a function to mount the app default is app.mount("#app")
  mount: Function,
};
```

## folder structure

Plugin loader will look for plugins in @/plugins subdirectory and will resolve them one by one according to file names and configuration of each plugin.
Each plugin must have a folder and index.js with default export of plugin config.

## Plugin configuration

```javascript
export default {
  /* name of plugins, used for dependencies or
   ignore, if not passed plugin-${number}
   will be selected as the name that number
   is the number for each plugin without name */
  name: String,
  /* defines that plugin should load before or
 after the app mount default value is pre */
  enfore: "pre" | "post",
  /* name of plugins that must load before this plugin */
  dependOn: Array | string,
  // decalre that that this plugin must fully load before going to load the next one or not
  parallel: Boolean
  // works like install, the app will passed as its argument
  setup: Function,
};
```

## hierarchy

It just works like nuxt plugin loading!
First it starts the loading by file name hierarchy, if it depends in some other plugin, It will load after then, and if it is not and parallel is setted to true it starts loading this plugin and goes to load the next one, and if it is setted to false, it fully load it and then it goes to the next one!
