import os
from typing import Any

from openai import AsyncOpenAI

from .base import AIProvider, ChatRequest, ChatResponse


class OpenAIProvider(AIProvider):
    name = "openai"

    def __init__(self) -> None:
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY is not configured")
        self.client = AsyncOpenAI(api_key=api_key)
        self.default_model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")

    async def chat(self, request: ChatRequest) -> ChatResponse:
        messages: list[dict[str, Any]] = []
        if request.system_prompt:
            messages.append({"role": "system", "content": request.system_prompt})
        messages.extend(request.history)
        messages.append({"role": "user", "content": request.message})

        response = await self.client.chat.completions.create(
            model=request.model or self.default_model,
            messages=messages,
        )
        choice = response.choices[0]
        return ChatResponse(
            text=choice.message.content or "",
            provider=self.name,
            model=response.model,
            usage=response.usage.model_dump() if response.usage else None,
        )

    async def health(self) -> dict[str, Any]:
        return {"provider": self.name, "healthy": True, "model": self.default_model}
