import importlib
from typing import Dict

from .base import AIProvider


class ProviderRegistry:
    """Small runtime registry so additional providers can be added without changing routes."""

    def __init__(self) -> None:
        self._providers: Dict[str, AIProvider] = {}

    def register(self, provider: AIProvider) -> None:
        self._providers[provider.name] = provider

    def get(self, name: str) -> AIProvider:
        if name not in self._providers:
            raise KeyError(f"Unknown AI provider: {name}")
        return self._providers[name]

    def names(self) -> list[str]:
        return sorted(self._providers)

    async def health(self) -> list[dict]:
        results = []
        for provider in self._providers.values():
            try:
                results.append(await provider.health())
            except Exception as exc:
                results.append({"provider": provider.name, "healthy": False, "error": str(exc)})
        return results


def build_default_registry() -> ProviderRegistry:
    registry = ProviderRegistry()
    module = importlib.import_module("backend.plugins.openai_provider")
    registry.register(module.OpenAIProvider())
    return registry
