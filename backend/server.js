const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shops');
const productRoutes = require('./routes/products');
const followRoutes = require('./routes/follows');
const chatStatusRoutes = require('./routes/chatStatus');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/follows', followRoutes);
app.use('/api', chatStatusRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Illuma API is running' });
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Illuma backend running on http://localhost:${PORT}`);
});
