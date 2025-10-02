import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse

app = FastAPI(title="FreshMart")

# Mount static files
app.mount("/frontend", StaticFiles(directory="frontend", html=True), name="frontend")

@app.get("/")
async def root():
    return {"message": "FreshMart is running!"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)