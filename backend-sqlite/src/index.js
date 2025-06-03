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

// Funções auxiliares para movimentações
const mapMovementToApi = (dbMovement) => ({
  ...dbMovement,
  productId: dbMovement.product_id,
  previousStock: dbMovement.previous_stock,
  currentStock: dbMovement.current_stock,
  userId: dbMovement.user_id,
  createdAt: dbMovement.created_at
});

const mapMovementToDb = (apiMovement) => ({
  ...apiMovement,
  product_id: apiMovement.productId,
  previous_stock: apiMovement.previousStock,
  current_stock: apiMovement.currentStock,
  user_id: apiMovement.userId
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

  // Se for apenas atualização de estoque
  if (Object.keys(dbProduct).length === 1 && 'stock' in dbProduct) {
    db.run(
      'UPDATE products SET stock = ? WHERE id = ?',
      [dbProduct.stock, req.params.id],
      (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        // Retorna o produto atualizado
        db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json(mapToApi(row));
        });
      }
    );
    return;
  }

  // Atualização completa do produto
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
      barcode = COALESCE(?, barcode),
      name = COALESCE(?, name),
      brand = COALESCE(?, brand),
      category = COALESCE(?, category),
      description = COALESCE(?, description),
      sale_type = COALESCE(?, sale_type),
      price = COALESCE(?, price),
      stock = COALESCE(?, stock),
      min_stock = COALESCE(?, min_stock),
      image_url = COALESCE(?, image_url)
    WHERE id = ?`,
    [barcode, name, brand, category, description, sale_type, price, stock, min_stock, image_url, req.params.id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Retorna o produto atualizado
      db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(mapToApi(row));
      });
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

// Rotas de movimentações de estoque
app.get('/api/stock-movements', (req, res) => {
  db.all('SELECT * FROM stock_movements ORDER BY date DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(mapMovementToApi));
  });
});

app.post('/api/stock-movements', (req, res) => {
  const dbMovement = mapMovementToDb(req.body);
  const {
    product_id,
    type,
    quantity,
    date,
    description,
    previous_stock,
    current_stock,
    user_id
  } = dbMovement;

  // Gerar ID único
  const id = Math.random().toString(36).substr(2, 9);

  db.run(
    `INSERT INTO stock_movements (
      id, product_id, type, quantity, date,
      description, previous_stock, current_stock, user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, product_id, type, quantity, date, description, previous_stock, current_stock, user_id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Retorna a movimentação no formato da API
      const apiMovement = mapMovementToApi({
        id,
        ...dbMovement
      });
      res.status(201).json(apiMovement);
    }
  );
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
