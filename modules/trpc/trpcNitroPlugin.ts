export default defineNitroPlugin(async () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await import("#wss");
});
