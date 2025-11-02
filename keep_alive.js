const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Ticket Bot is alive ✅'));

app.listen(PORT, () => {
  console.log(`🚀 Keep-alive server running on port ${PORT}`);
});
