const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initializeDatabase } = require('./database/init');

const app = express();
const port = 3000;

// Função auxiliar para resolver caminhos no pkg
const resolvePath = (relativePath) => {
  return process.pkg
    ? path.join(path.dirname(process.execPath), relativePath)
    : path.join(__dirname, relativePath);
};

// Determina o ambiente (dev ou prod)
const isDev = process.env.NODE_ENV === 'development';
const dbName = isDev ? 'dietetica_dev.db' : 'dietetica_prod.db';
console.log(`Ambiente: ${isDev ? 'Desenvolvimento' : 'Produção'}`);
console.log(`Usando banco: ${dbName}`);

// Middleware
app.use(cors());
app.use(express.json());

// Diretório do frontend Angular
const angularPath = process.pkg
  ? path.join(path.dirname(process.execPath), 'frontend')
  : path.join(__dirname, '../../dist/dietetica/browser');

// Garantir que o diretório do banco existe
const dbDir = process.pkg
  ? path.join(path.dirname(process.execPath), 'database')
  : path.join(__dirname, 'database');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Servir arquivos estáticos do Angular
app.use(express.static(angularPath));

// Caminho do banco de dados
const dbPath = path.join(dbDir, dbName);

// Conexão com o banco
const db = new sqlite3.Database(dbPath, async (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err);
  } else {
    console.log('Conectado ao banco SQLite em:', dbPath);
    try {
      await initializeDatabase(db);
      console.log('Banco de dados inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar banco:', error);
    }
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

// Funções auxiliares para mapear dados de vendas
const mapSaleToApi = (dbSale) => ({
  ...dbSale,
  customerId: dbSale.customer_id,
  createdBy: dbSale.created_by,
  updatedBy: dbSale.updated_by,
  createdAt: dbSale.created_at,
  updatedAt: dbSale.updated_at
});

const mapSaleToDb = (apiSale) => ({
  ...apiSale,
  customer_id: apiSale.customerId,
  created_by: apiSale.createdBy,
  updated_by: apiSale.updatedBy
});

const mapSaleItemToApi = (dbItem) => ({
  ...dbItem,
  productId: dbItem.product_id,
  variantId: dbItem.variant_id,
  unitPrice: dbItem.unit_price,
  createdAt: dbItem.created_at
});

const mapSaleItemToDb = (apiItem) => ({
  ...apiItem,
  product_id: apiItem.productId,
  variant_id: apiItem.variantId,
  unit_price: apiItem.unitPrice
});

// Funções auxiliares para mapear dados de cash-closing
const mapCashClosingToApi = (dbClosing) => ({
  id: dbClosing.id,
  openedAt: dbClosing.opened_at,
  closedAt: dbClosing.closed_at,
  payments: JSON.parse(dbClosing.payments),
  totalSales: dbClosing.total_sales,
  totalExpected: dbClosing.total_expected,
  totalActual: dbClosing.total_actual,
  difference: dbClosing.difference,
  notes: dbClosing.notes,
  status: dbClosing.status,
  closedBy: dbClosing.closed_by,
  createdAt: dbClosing.created_at
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

// Rotas de vendas
app.get('/api/sales', (req, res) => {
  const query = `
    SELECT s.*,
           GROUP_CONCAT(si.id) as item_ids,
           GROUP_CONCAT(p.id) as payment_ids
    FROM sales s
    LEFT JOIN sale_items si ON s.id = si.sale_id
    LEFT JOIN payments p ON s.id = p.sale_id
    GROUP BY s.id
    ORDER BY s.date DESC
  `;

  db.all(query, [], async (err, sales) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Para cada venda, buscar seus itens e pagamentos
    const salesWithDetails = await Promise.all(sales.map(async (sale) => {
      const itemIds = sale.item_ids ? sale.item_ids.split(',') : [];
      const paymentIds = sale.payment_ids ? sale.payment_ids.split(',') : [];

      // Buscar itens
      const items = await new Promise((resolve, reject) => {
        if (!itemIds.length) resolve([]);
        db.all('SELECT * FROM sale_items WHERE id IN (' + itemIds.join(',') + ')', [], (err, items) => {
          if (err) reject(err);
          resolve(items.map(mapSaleItemToApi));
        });
      });

      // Buscar pagamentos
      const payments = await new Promise((resolve, reject) => {
        if (!paymentIds.length) resolve([]);
        db.all('SELECT * FROM payments WHERE id IN (' + paymentIds.join(',') + ')', [], (err, payments) => {
          if (err) reject(err);
          resolve(payments);
        });
      });

      // Remover campos auxiliares e adicionar itens e pagamentos
      const { item_ids, payment_ids, ...saleData } = sale;
      return {
        ...mapSaleToApi(saleData),
        items,
        payments
      };
    }));

    res.json(salesWithDetails);
  });
});

app.get('/api/sales/:id', (req, res) => {
  const query = `
    SELECT s.*,
           GROUP_CONCAT(si.id) as item_ids,
           GROUP_CONCAT(p.id) as payment_ids
    FROM sales s
    LEFT JOIN sale_items si ON s.id = si.sale_id
    LEFT JOIN payments p ON s.id = p.sale_id
    WHERE s.id = ?
    GROUP BY s.id
  `;

  db.get(query, [req.params.id], async (err, sale) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!sale) {
      res.status(404).json({ error: 'Venda não encontrada' });
      return;
    }

    const itemIds = sale.item_ids ? sale.item_ids.split(',') : [];
    const paymentIds = sale.payment_ids ? sale.payment_ids.split(',') : [];

    // Buscar itens
    const items = await new Promise((resolve, reject) => {
      if (!itemIds.length) resolve([]);
      db.all('SELECT * FROM sale_items WHERE id IN (' + itemIds.join(',') + ')', [], (err, items) => {
        if (err) reject(err);
        resolve(items.map(mapSaleItemToApi));
      });
    });

    // Buscar pagamentos
    const payments = await new Promise((resolve, reject) => {
      if (!paymentIds.length) resolve([]);
      db.all('SELECT * FROM payments WHERE id IN (' + paymentIds.join(',') + ')', [], (err, payments) => {
        if (err) reject(err);
        resolve(payments);
      });
    });

    // Remover campos auxiliares e adicionar itens e pagamentos
    const { item_ids, payment_ids, ...saleData } = sale;
    res.json({
      ...mapSaleToApi(saleData),
      items,
      payments
    });
  });
});

app.post('/api/sales', (req, res) => {
  const dbSale = mapSaleToDb(req.body);
  const { items = [], payments = [] } = req.body;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    try {
      // Inserir a venda
      db.run(
        `INSERT INTO sales (
          date, subtotal, total, status, customer_id,
          notes, created_by, updated_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          dbSale.date || new Date().toISOString(),
          dbSale.subtotal,
          dbSale.total,
          dbSale.status || 'pending',
          dbSale.customer_id,
          dbSale.notes,
          dbSale.created_by,
          dbSale.updated_by
        ],
        function(err) {
          if (err) throw err;
          const saleId = this.lastID;

          // Inserir os itens
          const itemsStmt = db.prepare(`
            INSERT INTO sale_items (
              sale_id, product_id, variant_id, name,
              quantity, unit_price, price, subtotal
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);

          items.forEach(item => {
            const dbItem = mapSaleItemToDb(item);
            itemsStmt.run([
              saleId,
              dbItem.product_id,
              dbItem.variant_id,
              dbItem.name,
              dbItem.quantity,
              dbItem.unit_price,
              dbItem.price,
              dbItem.subtotal
            ], err => { if (err) throw err; });
          });
          itemsStmt.finalize();

          // Inserir os pagamentos
          const paymentsStmt = db.prepare(`
            INSERT INTO payments (
              sale_id, method, amount, reference
            ) VALUES (?, ?, ?, ?)
          `);

          payments.forEach(payment => {
            paymentsStmt.run([
              saleId,
              payment.method,
              payment.amount,
              payment.reference
            ], err => { if (err) throw err; });
          });
          paymentsStmt.finalize();

          // Se a venda for completada, atualizar o estoque
          if (dbSale.status === 'completed') {
            items.forEach(item => {
              db.run(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.productId],
                err => { if (err) throw err; }
              );
            });
          }

          db.run('COMMIT', err => {
            if (err) throw err;
            // Retornar a venda criada
            res.json({
              id: saleId,
              ...req.body,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          });
        }
      );
    } catch (err) {
      db.run('ROLLBACK');
      res.status(500).json({ error: err.message });
    }
  });
});

app.put('/api/sales/:id', (req, res) => {
  const dbSale = mapSaleToDb(req.body);
  const { status } = dbSale;

  // Se estiver apenas atualizando o status
  if (Object.keys(dbSale).length === 1 && status) {
    db.run(
      'UPDATE sales SET status = ? WHERE id = ?',
      [status, req.params.id],
      (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        // Se a venda for completada, atualizar o estoque
        if (status === 'completed') {
          db.all(
            'SELECT * FROM sale_items WHERE sale_id = ?',
            [req.params.id],
            (err, items) => {
              if (err) {
                res.status(500).json({ error: err.message });
                return;
              }

              items.forEach(item => {
                db.run(
                  'UPDATE products SET stock = stock - ? WHERE id = ?',
                  [item.quantity, item.product_id],
                  err => {
                    if (err) console.error('Erro ao atualizar estoque:', err);
                  }
                );
              });
            }
          );
        }

        // Retorna a venda atualizada
        db.get('SELECT * FROM sales WHERE id = ?', [req.params.id], (err, row) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json(mapSaleToApi(row));
        });
      }
    );
    return;
  }

  res.status(400).json({ error: 'Apenas atualização de status é permitida' });
});

// Rotas de fechamento de caixa
app.get('/api/cash-closings', (req, res) => {
  db.all('SELECT * FROM cash_closings ORDER BY closed_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(mapCashClosingToApi));
  });
});

app.get('/api/cash-closings/current', (req, res) => {
  db.get('SELECT * FROM cash_closings WHERE status = "open" ORDER BY opened_at DESC LIMIT 1', [], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row ? mapCashClosingToApi(row) : null);
  });
});

app.post('/api/cash-closings', (req, res) => {
  const {
    id,
    openedAt,
    closedAt,
    payments,
    totalSales,
    totalExpected,
    totalActual,
    difference,
    notes,
    status,
    closedBy
  } = req.body;

  db.run(
    `INSERT INTO cash_closings (
      id, opened_at, closed_at, payments,
      total_sales, total_expected, total_actual,
      difference, notes, status, closed_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      openedAt,
      closedAt,
      JSON.stringify(payments),
      totalSales,
      totalExpected,
      totalActual,
      difference,
      notes,
      status,
      closedBy
    ],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      db.get('SELECT * FROM cash_closings WHERE id = ?', [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(row);
      });
    }
  );
});

app.put('/api/cash-closings/:id', (req, res) => {
  const {
    closedAt,
    payments,
    totalSales,
    totalExpected,
    totalActual,
    difference,
    notes,
    status,
    closedBy
  } = req.body;

  db.run(
    `UPDATE cash_closings SET
      closed_at = ?,
      payments = ?,
      total_sales = ?,
      total_expected = ?,
      total_actual = ?,
      difference = ?,
      notes = ?,
      status = ?,
      closed_by = ?
    WHERE id = ?`,
    [
      closedAt,
      JSON.stringify(payments),
      totalSales,
      totalExpected,
      totalActual,
      difference,
      notes,
      status,
      closedBy,
      req.params.id
    ],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      db.get('SELECT * FROM cash_closings WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(mapCashClosingToApi(row));
      });
    }
  );
});

// Rota catch-all para o Angular (deve vir por último)
app.get('*', (req, res) => {
  res.sendFile(path.join(angularPath, 'index.html'));
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                   SISTEMA LOJA - BACKEND                    ║
║                                                            ║
║  🌐 Servidor rodando em: http://localhost:${port}           ║
║  📂 Frontend em: ${angularPath}                            ║
║  💾 Banco em: ${dbPath}                                    ║
║                                                            ║
║  Para acessar, abra no navegador: http://localhost:${port}  ║
╚════════════════════════════════════════════════════════════╝
  `);
});
