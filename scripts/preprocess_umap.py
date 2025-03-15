import json
import numpy as np
import umap
from pathlib import Path

# 保存先パス
EMBEDDINGS_PATH = Path("data/embeddings.json")
UMAP_OUTPUT_PATH = Path("data/umap_coordinates.json")

def load_data(path: Path):
    """指定した JSON ファイルからデータを読み込む"""
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data

def extract_embeddings(data):
    """
    各論文の埋め込み（embedding）を抽出して、
    numpy の配列に変換し、ID のリストも返す。
    """
    embeddings = []
    ids = []
    for entry in data:
        emb = entry.get("embedding")
        if emb is not None:
            embeddings.append(emb)
            ids.append(entry["id"])
    return np.array(embeddings), ids

def compute_umap(embeddings, n_neighbors=15, min_dist=0.1, n_components=2, metric="cosine"):
    """
    UMAP によって高次元の埋め込みを n_components 次元に削減する。
    """
    reducer = umap.UMAP(n_neighbors=n_neighbors, min_dist=min_dist, n_components=n_components, metric=metric)
    umap_embeddings = reducer.fit_transform(embeddings)
    return umap_embeddings

def save_umap_results(ids, umap_embeddings, output_path: Path):
    """
    各論文のIDと、それに対応するUMAP座標のマッピングを JSON ファイルに保存する。
    """
    # 各論文のIDと2次元座標を辞書形式に変換
    result = {str(id_): coord.tolist() for id_, coord in zip(ids, umap_embeddings)}
    # 出力先ディレクトリを作成
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=4)
    print(f"UMAP coordinates saved to {output_path}")

if __name__ == "__main__":
    print("Loading embeddings data...")
    data = load_data(EMBEDDINGS_PATH)
    embeddings, ids = extract_embeddings(data)
    print(f"Computing UMAP for {len(ids)} embeddings...")
    umap_embeddings = compute_umap(embeddings)
    save_umap_results(ids, umap_embeddings, UMAP_OUTPUT_PATH)
