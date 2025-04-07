import json
import numpy as np
from pathlib import Path
from sklearn.manifold import TSNE
from preprocess_utils import load_data, extract_embeddings

# 保存先パス
EMBEDDINGS_PATH = Path("data/embeddings.json")
TSNE_OUTPUT_PATH = Path("data/tsne_coordinates.json")

def compute_tsne(embeddings, n_components=2, perplexity=30, learning_rate=200):
    """
    t‑SNE によって高次元の埋め込みを n_components 次元に削減する。
    注意: t‑SNE は計算コストが高い場合があるため、大規模データではパラメータ調整が必要です。
    """
    tsne = TSNE(n_components=n_components, perplexity=perplexity, learning_rate=learning_rate)
    tsne_embeddings = tsne.fit_transform(embeddings)
    return tsne_embeddings

def save_results(ids, reduced_embeddings, output_path: Path):
    """各論文のIDと削減後の座標のマッピングを JSON に保存する。"""
    result = {str(id_): coord.tolist() for id_, coord in zip(ids, reduced_embeddings)}
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=4)
    print(f"t‑SNE coordinates saved to {output_path}")

if __name__ == "__main__":
    print("Loading embeddings data...")
    data = load_data(EMBEDDINGS_PATH)
    embeddings, ids = extract_embeddings(data)
    print(f"Computing t‑SNE for {len(ids)} embeddings...")
    tsne_embeddings = compute_tsne(embeddings)
    save_results(ids, tsne_embeddings, TSNE_OUTPUT_PATH)
