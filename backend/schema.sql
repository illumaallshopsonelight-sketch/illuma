-- ShopConnect Database Schema
-- Run this once against a fresh MySQL database, e.g.:
--   mysql -u root -p shopconnect < schema.sql

CREATE DATABASE IF NOT EXISTS shopconnect;
USE shopconnect;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shops (
    shop_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_name VARCHAR(100) NOT NULL,
    business_name VARCHAR(150) NOT NULL,
    category VARCHAR(50),
    phone_number VARCHAR(15) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    logo_url VARCHAR(255),
    description TEXT,
    slug VARCHAR(150) UNIQUE NOT NULL,
    subscription_tier ENUM('free', 'paid') DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE follows (
    follow_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    shop_id INT NOT NULL,
    followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id) ON DELETE CASCADE,
    UNIQUE KEY unique_follow (user_id, shop_id)
);

CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    in_stock BOOLEAN DEFAULT TRUE,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id) ON DELETE CASCADE
);

CREATE TABLE status_feed (
    status_id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    product_id INT NOT NULL,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

CREATE TABLE chats (
    chat_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    shop_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id) ON DELETE CASCADE,
    UNIQUE KEY unique_chat (user_id, shop_id)
);

CREATE TABLE messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id INT NOT NULL,
    sender_type ENUM('user', 'shop') NOT NULL,
    message_text TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(chat_id) ON DELETE CASCADE
);

CREATE TABLE subscriptions (
    subscription_id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    tier ENUM('free', 'paid') DEFAULT 'free',
    start_date DATE,
    end_date DATE,
    payment_status ENUM('active', 'expired', 'pending') DEFAULT 'pending',
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id) ON DELETE CASCADE
);

CREATE TABLE views_log (
    view_id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    user_id INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Sample seed data so the app has something to demo immediately
INSERT INTO shops (owner_name, business_name, category, phone_number, password_hash, slug, description)
VALUES
('Rina Kapoor', 'Rina''s Boutique', 'Clothing', '9999900001', 'placeholder_hash', 'rinas-boutique', 'Women''s ethnic and casual wear'),
('Sameer Singh', 'City Mobile Repair', 'Electronics', '9999900002', 'placeholder_hash', 'city-mobile-repair', 'Phone repair and accessories'),
('Anita Sharma', 'Sharma Bakery', 'Food', '9999900003', 'placeholder_hash', 'sharma-bakery', 'Fresh cakes and baked goods');

INSERT INTO products (shop_id, name, price, in_stock)
VALUES
(1, 'Cotton Kurti', 599.00, TRUE),
(1, 'Silk Saree', 1899.00, TRUE),
(1, 'Printed Dupatta', 349.00, TRUE),
(2, 'Screen Guard', 199.00, TRUE),
(2, 'Phone Case', 249.00, TRUE),
(3, 'Chocolate Truffle Cake', 450.00, TRUE);
