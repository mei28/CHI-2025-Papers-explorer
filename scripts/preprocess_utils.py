import json
import numpy as np
from pathlib import Path

def load_data(path: Path):
    """指定した JSON ファイルからデータを読み込む"""
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data

def extract_embeddings(data, embedding_key="embedding"):
    """
    各論文の埋め込み（embedding）を抽出して、
    NumPy の配列に変換し、ID のリストも返す。
    """
    embeddings = []
    ids = []
    for entry in data:
        emb = entry.get(embedding_key)
        if emb is not None:
            embeddings.append(emb)
            ids.append(entry["id"])
    return np.array(embeddings), ids
