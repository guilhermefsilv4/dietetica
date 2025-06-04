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

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
    customer_id INTEGER,
    notes TEXT,
    created_by TEXT NOT NULL,
    updated_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers (id)
);

-- Trigger para atualizar o updated_at em vendas
CREATE TRIGGER IF NOT EXISTS update_sales_timestamp
AFTER UPDATE ON sales
BEGIN
    UPDATE sales SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;

-- Tabela de itens da venda
CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    variant_id INTEGER,
    name TEXT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales (id),
    FOREIGN KEY (product_id) REFERENCES products (id),
    FOREIGN KEY (variant_id) REFERENCES product_variants (id)
);

-- Tabela de pagamentos
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    method TEXT CHECK (method IN ('cash', 'debit', 'credit', 'transfer', 'qr')) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    reference TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales (id)
);

-- Tabela de fechamento de caixa
CREATE TABLE IF NOT EXISTS cash_closings (
    id TEXT PRIMARY KEY,
    opened_at DATETIME NOT NULL,
    closed_at DATETIME,
    payments TEXT NOT NULL, -- JSON com os pagamentos
    total_sales DECIMAL(10,2) NOT NULL,
    total_expected DECIMAL(10,2) NOT NULL,
    total_actual DECIMAL(10,2) NOT NULL,
    difference DECIMAL(10,2) NOT NULL,
    notes TEXT,
    status TEXT CHECK (status IN ('open', 'closed')) NOT NULL,
    closed_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
