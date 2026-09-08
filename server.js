const env = require("./config/env");
const app = require("./app");

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Invoice Management SaaS API server running on http://localhost:${PORT}`);
  console.log(`📌 Environment: ${env.NODE_ENV}`);
});
