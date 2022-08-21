import * as monaco from "monaco-editor";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("app:mounted", () => {
    const colorMode = useColorMode();

    const setEditorColorMode = () => {
      if (colorMode.value == "light") {
        monaco.editor.setTheme("vs");
      } else if (colorMode.value == "dark") {
        monaco.editor.setTheme("vs-dark");
      }
    };

    setEditorColorMode();
    watch(colorMode, setEditorColorMode);
  });
  return nuxtApp;
});
