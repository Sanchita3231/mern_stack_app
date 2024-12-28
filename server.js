
import os

# Define the project structure
project_name = "mern_stack_app"
structure = {
    "backend": {
        "server.js": """\
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
app.use(express.json());

const transactionSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  dateOfSale: Date,
  category: String,
  sold: Boolean,
});

const Transaction = mongoose.model('Transaction', transactionSchema);

mongoose.connect('mongodb://localhost:27017/roxiler', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get('/api/initialize', async (req, res) => {
  try {
    const { data } = await axios.get(
      'https://s3.amazonaws.com/roxiler.com/product_transaction.json'
    );
    await Transaction.deleteMany();
    await Transaction.insertMany(data);
    res.status(200).send({ message: 'Database initialized successfully!' });
  } catch (error) {
    res.status(500).send({ error: 'Failed to initialize database' });
  }
});

app.get('/api/transactions', async (req, res) => {
  const { page = 1, perPage = 10, search = '', month } = req.query;
  const query = { dateOfSale: { $regex: `-${month.padStart(2, '0')}-` } };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { price: { $regex: search } },
    ];
  }

  try {
    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(+perPage);
    res.status(200).send(transactions);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch transactions' });
  }
});

app.get('/api/statistics', async (req, res) => {
  const { month } = req.query;
  const query = { dateOfSale: { $regex: `-${month.padStart(2, '0')}-` } };

  try {
    const totalSale = await Transaction.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$price' } } },
    ]);

    const soldCount = await Transaction.countDocuments({ ...query, sold: true });
    const unsoldCount = await Transaction.countDocuments({ ...query, sold: false });

    res.status(200).send({
      totalSale: totalSale[0]?.total || 0,
      soldCount,
      unsoldCount,
    });
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch statistics' });
  }
});

app.get('/api/bar-chart', async (req, res) => {
  const { month } = req.query;
  const query = { dateOfSale: { $regex: `-${month.padStart(2, '0')}-` } };

  try {
    const ranges = [
      [0, 100],
      [101, 200],
      [201, 300],
      [301, 400],
      [401, 500],
      [501, 600],
      [601, 700],
      [701, 800],
      [801, 900],
      [901, Infinity],
    ];

    const result = await Promise.all(
      ranges.map(async ([min, max]) => {
        const count = await Transaction.countDocuments({
          ...query,
          price: { $gte: min, $lt: max },
        });
        return { range: `${min}-${max === Infinity ? 'above' : max}`, count };
      })
    );

    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch bar chart data' });
  }
});

app.get('/api/pie-chart', async (req, res) => {
  const { month } = req.query;
  const query = { dateOfSale: { $regex: `-${month.padStart(2, '0')}-` } };

  try {
    const result = await Transaction.aggregate([
      { $match: query },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch pie chart data' });
  }
});