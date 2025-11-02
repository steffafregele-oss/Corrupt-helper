const express = require('express');
const app = express();

app.get("/", (req, res) => {
  res.send("Bot is alive!");
});

const PORT = 5000;

function keepAlive() {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running 24/7 on port ${PORT}`);
  });
}

module.exports = keepAlive;
