from abc import ABC, abstractmethod
from typing import Generic, TypeVar


T = TypeVar("T")


class BaseParser(ABC, Generic[T]):
    """
    Base interface for security scanner parsers.

    Each scanner parser must convert scanner-specific
    output into a normalized internal representation.
    """

    @abstractmethod
    def parse(self, data: str) -> list[T]:
        """
        Parse scanner output.

        Args:
            data: Raw scanner output.

        Returns:
            List of normalized records.
        """
        raise NotImplementedError