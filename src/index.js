const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

const indexRouter = require("./routes/index.routes");
const { connect } = require("./database/connection");
connect();

app.use("/api", indexRouter);
app.all("*", async (req, res) => {
    return res.status(404).json({
        message: `Endpoint not found!`
    });
})

const port = 3000;
app.listen(port, () => {
    console.log('\x1Bc');
    console.log(`Listening on port ${port}!`);
});
