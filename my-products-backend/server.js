const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Helper function to read JSON files
function readProductsFromFile(filename) {
  try {
    const filePath = path.join(__dirname, 'data', filename);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

// Football products
app.get('/products/football', (req, res) => {
  const footballProducts = readProductsFromFile('football.json');
  res.json(footballProducts);
});

// Basketball products
app.get('/products/basketball', (req, res) => {
  const basketballProducts = readProductsFromFile('basketball.json');
  res.json(basketballProducts);
});

// Table Tennis products
app.get('/products/tabletennis', (req, res) => {
  const tableTennisProducts = readProductsFromFile('tabletennis.json');
  res.json(tableTennisProducts);
});

// Volleyball products
app.get('/products/vollyball', (req, res) => {
  const volleyballProducts = readProductsFromFile('vollyball.json');
  res.json(volleyballProducts);
});

// All products combined
app.get('/products/all', (req, res) => {
  const football = readProductsFromFile('football.json');
  const basketball = readProductsFromFile('basketball.json');
  const tabletennis = readProductsFromFile('tabletennis.json');
  const vollyball = readProductsFromFile('vollyball.json');
  
  const allProducts = [...football, ...basketball, ...tabletennis, ...vollyball];
  res.json(allProducts);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`⚽ Football: http://localhost:3000/products/football`);
  console.log(`🏀 Basketball: http://localhost:3000/products/basketball`);
  console.log(`🎾 Table Tennis: http://localhost:3000/products/tabletennis`);
  console.log(`🏐 Volleyball: http://localhost:3000/products/vollyball`);
  console.log(`📦 All Products: http://localhost:3000/products/all`);
});