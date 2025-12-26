CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    profile_pic VARCHAR(255) DEFAULT 'default.png'
);

CREATE TABLE boards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,             -- kuka loi
    title VARCHAR(255) NOT NULL,
    visibility ENUM('private','shared') NOT NULL,
    group_code VARCHAR(10) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

