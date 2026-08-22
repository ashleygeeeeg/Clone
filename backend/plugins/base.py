from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Dict, Optional


@dataclass
class ChatRequest:
    message: str
    history: list[dict[str, str]]
    model: Optional[str] = None
    system_prompt: Optional[str] = None


@dataclass
class ChatResponse:
    text: str
    provider: str
    model: str
    usage: Optional[Dict[str, Any]] = None


class AIProvider(ABC):
    """Provider adapter contract used by the self-hosted chat service."""

    name: str = "unknown"

    @abstractmethod
    async def chat(self, request: ChatRequest) -> ChatResponse:
        raise NotImplementedError

    async def health(self) -> Dict[str, Any]:
        return {"provider": self.name, "healthy": True}
