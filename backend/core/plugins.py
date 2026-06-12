from abc import ABC, abstractmethod
from typing import Dict, Any

class Plugin(ABC):
    name = ""
    version = "1.0.0"

    @abstractmethod
    async def connect(self):
        pass

    @abstractmethod
    async def execute(self, payload: Dict[str, Any]):
        pass

    @abstractmethod
    async def disconnect(self):
        pass

class PluginRegistry:
    def __init__(self):
        self.plugins = {}

    def register(self, plugin: Plugin):
        self.plugins[plugin.name] = plugin

    def get(self, name: str):
        return self.plugins.get(name)

    def list(self):
        return list(self.plugins.keys())

registry = PluginRegistry()
