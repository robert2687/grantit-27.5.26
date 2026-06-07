import { createApp } from "./app";

const port = Number(process.env.PORT ?? 4103);
const { app } = createApp();

app.listen(port, () => {
  console.log(`administration service listening on :${port}`);
});