import numpy as np
from sklearn.manifold import TSNE
from .base import DimensionalityReducer

class TSNEReducer(DimensionalityReducer):
    def __init__(self, n_components=2, perplexity=30, learning_rate=200):
        self.tsne = TSNE(n_components=n_components, perplexity=perplexity, learning_rate=learning_rate)

    def reduce(self, embeddings: np.ndarray) -> np.ndarray:
        return self.tsne.fit_transform(embeddings)
