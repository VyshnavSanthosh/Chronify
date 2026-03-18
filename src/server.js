import app from "./app.js";
import { port } from "./config/index.js";
import connectDB from "./config/db.js";

// connect with mongodb
connectDB();

app.listen(port, () => {
    console.log(`Chronify listening on http://localhost:${port}/auth/login`);
});
