const express = require("express");
const path = require("path");
const app = express();

const { REACT_APP_BACKEND_URL, REACT_APP_HOURS_CLOSE_TICKETS_AUTO } = process.env;

app.use(express.static(path.join(__dirname, "build")));

app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = process.env.PORT || 3250;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Backend URL: ${REACT_APP_BACKEND_URL}`);
  console.log(`Close Tickets Auto Hours: ${REACT_APP_HOURS_CLOSE_TICKETS_AUTO}`);
});
