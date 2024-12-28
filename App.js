"frontend": {
        "src/App.js": """\
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [month, setMonth] = useState('03'); 
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchTransactions();
    fetchStatistics();
    fetchBarData();
    fetchPieData();
  }, [month, search, page]);

  const fetchTransactions = async () => {
    const { data } = await axios.get('/api/transactions', {
      params: { month, search, page },
    });
    setTransactions(data);
  };

  const fetchStatistics = async () => {
    const { data } = await axios.get('/api/statistics', { params: { month } });
    setStatistics(data);
  };

  const fetchBarData = async () => {
    const { data } = await axios.get('/api/bar-chart', { params: { month } });
    setBarData(data);
  };

  const fetchPieData = async () => {
    const { data } = await axios.get('/api/pie-chart', { params: { month } });
    setPieData(data);
  };

  return (
    <div>
      <h1>Transactions Dashboard</h1>

      <select value={month} onChange={(e) => setMonth(e.target.value)}>
        {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(
          (m) => (
            <option key={m} value={m}>
              {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
            </option>
          )
        )}
      </select>

      <input
        type=\"text\"
        placeholder=\"Search transactions...\"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Sold</th>
            <th>Date of Sale</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx._id}>
              <td>{tx.title}</td>
              <td>{tx.description}</td>
              <td>{tx.price}</td>
              <td>{tx.sold ? 'Yes' : 'No'}</td>
              <td>{new Date(tx.dateOfSale).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>Previous</button>
      <button onClick={() => setPage((prev) => prev + 1)}>Next</button>

      <div>
        <h2>Statistics</h2>
        <p>Total Sale: {statistics.totalSale}</p>
        <p>Sold Items: {statistics.soldCount}</p>
        <p>Unsold Items: {statistics.unsoldCount}</p>
      </div>

      <div>
        <h2>Bar Chart</h2>
        <ul>
          {barData.map((bar) => (
            <li key={bar.range}>
              {bar.range}: {bar.count}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Pie Chart</h2>
        <ul>
          {pieData.map((pie) => (
            <li key={pie._id}>
              {pie._id}: {pie.count}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
