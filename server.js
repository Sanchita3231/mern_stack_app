require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/roxilerDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const transactionSchema = new mongoose.Schema({
  id: Number,
  title: String,
  description: String,
  price: Number,
  category: String,
  dateOfSale: Date,
  sold: Boolean,
});

const Transaction = mongoose.model("Transaction", transactionSchema);

app.get("/api/init", async (req, res) => {
  try {
    const response = await axios.get("https://s3.amazonaws.com/roxiler.com/product_transaction.json");
    await Transaction.deleteMany({});
    await Transaction.insertMany(response.data);
    res.status(200).json({ message: "Database initialized successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/transactions", async (req, res) => {
  let { month, search = "", page = 1, perPage = 10 } = req.query;
  const startDate = new Date(`2023-${month}-01`);
  const endDate = new Date(`2023-${month}-31`);

  const filter = {
    dateOfSale: { $gte: startDate, $lte: endDate },
    $or: [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { price: { $regex: search, $options: "i" } },
    ],
  };

  const transactions = await Transaction.find(filter)
    .skip((page - 1) * perPage)
    .limit(Number(perPage));

  res.json(transactions);
});

app.listen(5000, () => console.log("Backend server running on port 5000"));
