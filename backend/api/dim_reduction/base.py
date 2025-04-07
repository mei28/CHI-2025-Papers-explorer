import numpy as np
from abc import ABC, abstractmethod

class DimensionalityReducer(ABC):
    @abstractmethod
    def reduce(self, embeddings: np.ndarray) -> np.ndarray:
        """
        高次元の埋め込みを低次元に削減する。

        Args:
            embeddings (np.ndarray): 高次元の埋め込み配列

        Returns:
            np.ndarray: 次元削減後の座標配列
        """
        pass

