import umap
import numpy as np
from .base import DimensionalityReducer

class UMAPReducer(DimensionalityReducer):
    def __init__(self, n_neighbors=15, min_dist=0.1, n_components=2, metric="cosine"):
        self.reducer = umap.UMAP(n_neighbors=n_neighbors, min_dist=min_dist,
                                   n_components=n_components, metric=metric)

    def reduce(self, embeddings: np.ndarray) -> np.ndarray:
        return self.reducer.fit_transform(embeddings)
