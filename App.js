import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/transactions?month=03&page=1&perPage=10")
      .then(response => setTransactions(response.data))
      .catch(error => console.error("Error fetching transactions:", error));
  }, []);

  return (
    <div>
      <h1>Transaction List</h1>
      <ul>
        {transactions.map((txn) => (
          <li key={txn.id}>{txn.title} - ${txn.price}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
