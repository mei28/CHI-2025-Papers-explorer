import json
import numpy as np
from pathlib import Path
from sklearn.decomposition import PCA
from preprocess_utils import load_data, extract_embeddings

# 保存先パス
EMBEDDINGS_PATH = Path("data/embeddings.json")
PCA_OUTPUT_PATH = Path("data/pca_coordinates.json")

def compute_pca(embeddings, n_components=2):
    """PCA によって高次元の埋め込みを n_components 次元に削減する。"""
    pca = PCA(n_components=n_components)
    pca_embeddings = pca.fit_transform(embeddings)
    return pca_embeddings

def save_results(ids, reduced_embeddings, output_path: Path):
    """各論文のIDと削減後の座標のマッピングを JSON に保存する。"""
    result = {str(id_): coord.tolist() for id_, coord in zip(ids, reduced_embeddings)}
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=4)
    print(f"PCA coordinates saved to {output_path}")

if __name__ == "__main__":
    print("Loading embeddings data...")
    data = load_data(EMBEDDINGS_PATH)
    embeddings, ids = extract_embeddings(data)
    print(f"Computing PCA for {len(ids)} embeddings...")
    pca_embeddings = compute_pca(embeddings)
    save_results(ids, pca_embeddings, PCA_OUTPUT_PATH)

