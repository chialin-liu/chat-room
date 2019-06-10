const express = require("express");
const path = require("path");
const app = express();
const port = process.env.port | 3900;
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));
app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
