import numpy as np
from sklearn.decomposition import PCA
from .base import DimensionalityReducer

class PCAReducer(DimensionalityReducer):
    def __init__(self, n_components=2):
        self.pca = PCA(n_components=n_components)

    def reduce(self, embeddings: np.ndarray) -> np.ndarray:
        return self.pca.fit_transform(embeddings)
