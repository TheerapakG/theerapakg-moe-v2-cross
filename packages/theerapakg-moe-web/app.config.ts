export default defineAppConfig({
  ui: {
    button: {
      default: {
        color: "white",
      },
    },
    range: {
      ring: "focus-visible:ring-2 focus-visible:ring-gray-500 dark:focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900",
      progress: { background: "bg-gray-500 dark:bg-gray-400" },
      thumb: { color: "text-gray-500 dark:text-gray-400" },
    },
    table: {
      th: {
        base: "text-center whitespace-nowrap",
      },
      td: {
        base: "text-center whitespace-nowrap",
      },
    },
  },
});
