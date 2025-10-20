"""
Chronos Backend - FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.repository import router as repository_router

app = FastAPI(
    title="Chronos API",
    version="1.0.0",
    description="本地文件时光机 - Git版本管理工具API",
)

# Configure CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:1420",  # Tauri default dev port
        "tauri://localhost",  # Tauri production
        "https://tauri.localhost",  # Tauri production alternative
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "success": True,
        "data": {"message": "Chronos Backend is running", "version": "1.0.0"},
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "service": "chronos-backend"}


# 注册路由
app.include_router(repository_router, prefix="/api")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8765)
