import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


class EmbeddingSearch:
    def __init__(self, papers, embedding_key="embedding", model_name="all-MiniLM-L6-v2"):
        """
        論文データのリストを受け取り、各エントリに対して embedding キーがあるもののみを利用します。
        embedding キーがあるものを抽出して、NumPy 配列に変換します。

        Args:
            papers (list): 論文データのリスト。各エントリは "embedding" キーを持っていることが期待される。
            embedding_key (str): 埋め込みが保存されているキー
            model_name (str): クエリを埋め込みに変換するために使用する SentenceTransformer モデル名
        """
        self.all_papers = papers
        # "embedding" が有効なエントリのみをフィルタリング
        self.valid_papers = [paper for paper in papers if paper.get(embedding_key) is not None]
        if not self.valid_papers:
            raise ValueError("No valid embeddings found in papers.")
        # 各エントリの埋め込みを NumPy 配列に変換
        self.embeddings = np.array([paper.get(embedding_key) for paper in self.valid_papers])
        # もし 1D になってしまっている場合は、2D に reshape する
        if self.embeddings.ndim == 1:
            self.embeddings = self.embeddings.reshape(1, -1)
        self.model = SentenceTransformer(model_name)

    def search(self, query, top_n=10):
        # クエリの埋め込みを計算
        query_embedding = self.model.encode(query)
        if query_embedding.ndim == 1:
            query_embedding = query_embedding.reshape(1, -1)
        # コサイン類似度を計算
        similarities = cosine_similarity(query_embedding, self.embeddings).flatten()
        top_indices = np.argsort(similarities)[::-1][:top_n]
        results = []
        for idx in top_indices:
            paper = self.valid_papers[idx]
            results.append(
                {
                    "id": paper["id"],
                    "url": paper["url"],
                    "title": paper["title"],
                    "abstract": paper.get("abstract",''),
                    "score": float(similarities[idx]) or 0.0 ,
                    "authors": paper.get("authors", []),
                    "details": paper.get("details", {}),
                    "sessions": paper.get("sessions", []),
                }
            )
        return results
