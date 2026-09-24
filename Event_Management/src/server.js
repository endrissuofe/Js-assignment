const config = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');

(async () => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`EventHorizon API running on http://localhost:${config.port} (${config.nodeEnv})`);
  });
})();
