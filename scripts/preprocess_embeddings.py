import json
import os
from pathlib import Path
from tqdm import tqdm
from sentence_transformers import SentenceTransformer
import time

# 入力となるスクレイピング済みデータと出力先
SCRAPED_DATA_PATH = Path("data/scraped_data_0314.json")
EMBEDDINGS_PATH = Path("data/embeddings.json")


def load_scraped_data(path: Path):
    """JSON ファイルからスクレイピング済みデータを読み込みます"""
    if not path.exists():
        raise FileNotFoundError(f"{path} does not exist.")
    with open(str(path), "r", encoding="utf-8") as f:
        data = json.load(f)
    return data


def save_embeddings(data, path: Path):
    """計算済みデータを JSON ファイルに保存します"""
    os.makedirs(path.parent, exist_ok=True)
    with open(str(path), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    print(f"Embeddings saved to {path}")


def compute_embeddings(data, save_interval=10, output_path=EMBEDDINGS_PATH):
    """
    各論文の title と abstract を結合してテキストを作成し、
    SentenceTransformer モデルで埋め込みを計算します。
    すでに embedding が存在する場合はスキップし、一定件数ごとに中間結果を保存します。
    """
    model = SentenceTransformer("all-MiniLM-L6-v2")
    for i, entry in enumerate(tqdm(data, desc="Computing embeddings")):
        # すでに埋め込みが計算済みならスキップ
        if "embedding" in entry and entry["embedding"]:
            continue

        title = entry.get("title", "")
        abstract = entry.get("abstract", "")
        combined_text = f"{title} {abstract}".strip()
        if combined_text:
            embedding = model.encode(combined_text).tolist()
            entry["embedding"] = embedding
        else:
            entry["embedding"] = None

        # 定期的に中間結果を保存
        if (i + 1) % save_interval == 0:
            save_embeddings(data, output_path)
            print(f"Intermediate save after {i + 1} entries.")
    return data


if __name__ == "__main__":
    print("Loading scraped data...")
    scraped_data = load_scraped_data(SCRAPED_DATA_PATH)
    print("Computing embeddings for each entry...")
    data_with_embeddings = compute_embeddings(scraped_data, save_interval=10, output_path=EMBEDDINGS_PATH)
    print("Saving final results...")
    save_embeddings(data_with_embeddings, EMBEDDINGS_PATH)
