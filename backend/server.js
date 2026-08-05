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

// Route mounting
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/follows', followRoutes);
app.use('/api', chatStatusRoutes); // exposes /api/chat/:shopId and /api/status

app.get('/', (req, res) => {
  res.json({ message: 'ShopConnect API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ShopConnect backend running on http://localhost:${PORT}`);
});
