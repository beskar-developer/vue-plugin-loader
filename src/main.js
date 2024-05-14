import { createApp } from "vue";
import App from "./App.vue";
import { pluginLoader } from "@packages/plugin-loader";

const app = createApp(App);
app.use(pluginLoader);
