import sys
from pathlib import Path

import os
import tempfile

# Test dùng DB tạm, không ghi vào backend/app.db (phải đặt trước khi import app)
os.environ["DATABASE_URL"] = "sqlite:///" + os.path.join(tempfile.mkdtemp(), "test.db")
# Ảnh test cũng lưu vào thư mục tạm, không ghi vào backend/uploads
os.environ["UPLOAD_DIR"] = tempfile.mkdtemp()

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))  # cho phép import app
