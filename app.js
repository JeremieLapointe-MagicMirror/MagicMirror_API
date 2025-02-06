const express = require("express");
const app = express();
app.use(express.json());
require("dotenv");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
});
