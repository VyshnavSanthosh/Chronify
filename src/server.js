const app = require("./app")
const {port} = require("./config/index");
const connectDB = require('./config/db');

// connect with mongodb
connectDB()
app.listen(port, () =>
    console.log(`Chronify listening on http://localhost:${port}/auth/login`)
);