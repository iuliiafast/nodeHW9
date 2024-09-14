import express from 'express';
import routes from './routes.js';

const app = express();
const PORT = 3002;

app.use(express.json());
app.use(routes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});