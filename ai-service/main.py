from fastapi import FastAPI

app = FastAPI(title="AI Service")


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "ai-service"}


@app.get("/")
def root() -> dict:
    return {"message": "AI service is ready"}
