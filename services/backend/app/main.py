from fastapi import FastAPI

app = FastAPI()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/agent/command")
def command(prompt: dict):
    # Minimal placeholder to match README curl example
    return {"received": prompt}

