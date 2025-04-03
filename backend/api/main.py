from fastapi import FastAPI, Query, HTTPException
from mangum import Mangum
from pydantic import BaseModel
from typing import List, Dict, Optional, Union
import json
from pathlib import Path
import uvicorn
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

from backend.api.search.search_config import SEARCH_METHOD
from backend.api.search.tfidf_search import TfidfSearch
from backend.api.search.embedding_search import EmbeddingSearch

app = FastAPI(title="CHI Paper Search API")

# CORS ミドルウェアの追加
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://mei28.github.io/*",
    ],  # フロントエンドのURLを指定
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# データファイルのパス
DATA_PATH = Path("data/scraped_data_0314.json")
EMBEDDINGS_PATH = Path("data/embeddings.json")
UMAP_PATH = Path("data/umap_coordinates.json")

# グローバル変数
papers: List[Dict] = []
search_engine: Optional[Union[TfidfSearch, EmbeddingSearch]] = None


def load_data():
    """
    可能であれば、埋め込み付きのデータ (embeddings.json) を優先して読み込み、
    存在しなければ scraped_data_0314.json を読み込みます。
    """
    global papers
    if EMBEDDINGS_PATH.exists():
        with open(EMBEDDINGS_PATH, "r", encoding="utf-8") as f:
            papers = json.load(f)
        print(f"Loaded {len(papers)} papers from embeddings data.")
    elif DATA_PATH.exists():
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            papers = json.load(f)
        print(f"Loaded {len(papers)} papers from scraped data (no embeddings).")
    else:
        papers = []
        print("No data file found.")


@app.on_event("startup")
def startup_event():
    global search_engine
    load_data()
    if SEARCH_METHOD == "tfidf":
        search_engine = TfidfSearch(papers)
    elif SEARCH_METHOD == "embedding":
        try:
            search_engine = EmbeddingSearch(papers)
        except ValueError as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        raise ValueError("Invalid SEARCH_METHOD")
    print(f"Using {SEARCH_METHOD} search method.")


class Author(BaseModel):
    name: str
    affiliation: Optional[str] = None


class Session(BaseModel):
    session_name: Optional[str] = None
    session_date: Optional[str] = None
    session_venue: Optional[str] = None


class SearchResult(BaseModel):
    id: int
    url: str
    title: str
    abstract: Optional[str] ="" 
    score: float
    authors: Optional[List[Author]] = []
    details: Optional[Dict[str, str]] = {}
    sessions: Optional[List[Session]] = []


@app.get("/search", response_model=List[SearchResult])
def search(query: str = Query(..., description="Search query string"), top_n: int = 10):
    assert search_engine is not None, "Search engine not initialized"
    results = search_engine.search(query, top_n=top_n)
    return results


@app.get("/umap", response_model=Dict[str, List[float]])
def get_umap_coordinates():
    if UMAP_PATH.exists():
        with open(UMAP_PATH, "r", encoding="utf-8") as f:
            umap_coords = json.load(f)
        return umap_coords
    return {}

# ヘルスチェック用エンドポイント
@app.get("/check")
@app.get("/health")
def health_check():
    return {"status": "ok"}


handler = Mangum(app)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
