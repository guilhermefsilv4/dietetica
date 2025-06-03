const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexão com o banco
const db = new sqlite3.Database(path.join(__dirname, 'database/dietetica.db'), (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err);
  } else {
    console.log('Conectado ao banco SQLite');
  }
});

// Funções auxiliares para mapear dados
const mapToApi = (dbProduct) => ({
  ...dbProduct,
  imageUrl: dbProduct.image_url,
  saleType: dbProduct.sale_type,
  minStock: dbProduct.min_stock,
  createdAt: dbProduct.created_at,
  updatedAt: dbProduct.updated_at
});

const mapToDb = (apiProduct) => ({
  ...apiProduct,
  image_url: apiProduct.imageUrl,
  sale_type: apiProduct.saleType,
  min_stock: apiProduct.minStock
});

// Rotas
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(mapToApi));
  });
});

app.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Produto não encontrado' });
      return;
    }
    res.json(mapToApi(row));
  });
});

app.post('/api/products', (req, res) => {
  const dbProduct = mapToDb(req.body);
  const {
    barcode,
    name,
    brand,
    category,
    description,
    sale_type,
    price,
    stock,
    min_stock,
    image_url
  } = dbProduct;

  db.run(
    `INSERT INTO products (
      barcode, name, brand, category, description,
      sale_type, price, stock, min_stock, image_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [barcode, name, brand, category, description, sale_type, price, stock, min_stock, image_url],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Retorna o produto no formato da API
      const apiProduct = mapToApi({
        id: this.lastID,
        ...dbProduct
      });
      res.json(apiProduct);
    }
  );
});

app.put('/api/products/:id', (req, res) => {
  const dbProduct = mapToDb(req.body);
  const {
    barcode,
    name,
    brand,
    category,
    description,
    sale_type,
    price,
    stock,
    min_stock,
    image_url
  } = dbProduct;

  db.run(
    `UPDATE products SET
      barcode = ?,
      name = ?,
      brand = ?,
      category = ?,
      description = ?,
      sale_type = ?,
      price = ?,
      stock = ?,
      min_stock = ?,
      image_url = ?
    WHERE id = ?`,
    [barcode, name, brand, category, description, sale_type, price, stock, min_stock, image_url, req.params.id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Retorna o produto no formato da API
      const apiProduct = mapToApi({
        id: req.params.id,
        ...dbProduct
      });
      res.json(apiProduct);
    }
  );
});

app.delete('/api/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Produto deletado com sucesso' });
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
}); 