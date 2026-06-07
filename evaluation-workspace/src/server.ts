import { createApp } from "./app";

const port = Number(process.env.PORT ?? 8085);
const { app } = createApp();

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`evaluation-workspace listening on port ${port}`);
});