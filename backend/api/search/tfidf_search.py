import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class TfidfSearch:
    def __init__(self, papers):
        """
        papers: 論文データのリスト。各エントリは "title" と "abstract" を含む想定。
        """
        self.papers = papers
        # 各論文のタイトルとアブストラクトを連結した文書を作成
        self.documents = [f"{p.get('title','')} {p.get('abstract','')}" for p in papers]
        self.vectorizer = TfidfVectorizer(stop_words="english")
        self.tfidf_matrix = self.vectorizer.fit_transform(self.documents)
        
    def search(self, query, top_n=10):
        query_vec = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        # 類似度が高い順に上位 top_n 件のインデックスを取得
        top_indices = np.argsort(similarities)[::-1][:top_n]
        results = []
        for idx in top_indices:
            paper = self.papers[idx]
            results.append({
                "id": paper["id"],
                "url": paper["url"],
                "title": paper["title"],
                "abstract": paper["abstract"],
                "score": float(similarities[idx]),
                "authors": paper.get("authors", []),
                "details": paper.get("details", {}),
                "sessions": paper.get("sessions", []),
            })
        return results

