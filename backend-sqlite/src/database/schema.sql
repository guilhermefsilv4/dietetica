CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    barcode TEXT UNIQUE,
    name TEXT NOT NULL,
    brand TEXT,
    category TEXT,
    description TEXT,
    sale_type TEXT CHECK (sale_type IN ('unit', 'weight')) DEFAULT 'unit',
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER DEFAULT 10,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para atualizar o updated_at
CREATE TRIGGER IF NOT EXISTS update_products_timestamp
AFTER UPDATE ON products
BEGIN
    UPDATE products SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;

-- Tabela de movimentações de estoque
CREATE TABLE IF NOT EXISTS stock_movements (
    id TEXT PRIMARY KEY,
    product_id INTEGER NOT NULL,
    type TEXT CHECK (type IN ('entrada', 'salida', 'ajuste')) NOT NULL,
    quantity INTEGER NOT NULL,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    previous_stock INTEGER NOT NULL,
    current_stock INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id)
);
