import { createApp } from "./app";

const port = Number(process.env.PORT ?? 4104);
const { app } = createApp();

app.listen(port, () => {
    console.log(`system-settings service listening on :${port}`);
});
