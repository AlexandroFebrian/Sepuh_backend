const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cors());

const indexRouter = require('./routes/index.routes');

app.use("/api", indexRouter);

const port = 3000
app.listen(port, () => {
  console.log(`listening on port ${port}`)
});