-- V2: bổ sung cột metadata cho prediction_logs (V1 bản đầu chưa có).
-- IF NOT EXISTS: chạy an toàn cả trên DB đã có cột này.
ALTER TABLE prediction_logs ADD COLUMN IF NOT EXISTS metadata JSONB;