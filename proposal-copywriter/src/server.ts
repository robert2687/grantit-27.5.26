import { createApp } from "./app";

const port = Number(process.env.PORT ?? 8086);
const { app } = createApp();

app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`proposal-copywriter listening on port ${port}`);
});
