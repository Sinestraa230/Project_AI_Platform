-- Phiên đăng nhập: mỗi lần login tạo 1 dòng, logout xoá dòng đó.
-- Chỉ lưu SHA-256 của token, không lưu token gốc.
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    token_hash VARCHAR(64) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX ix_sessions_user_id ON sessions(user_id);
