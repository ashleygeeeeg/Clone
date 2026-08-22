from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel


class ProviderConfig(BaseModel):
    provider: str
    enabled: bool = True
    model: str | None = None


def register_admin_routes(router: APIRouter, db: Any, registry: Any, get_current_user):
    admin = APIRouter(prefix="/admin", tags=["admin"])

    async def require_admin(user=Depends(get_current_user)):
        if not user.get("is_admin", False) and user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return user

    @admin.get("/providers")
    async def providers(_user=Depends(require_admin)):
        configured = await db.provider_configs.find({}, {"_id": 0}).to_list(100)
        return {"available": registry.names(), "configured": configured}

    @admin.put("/providers")
    async def configure_provider(config: ProviderConfig, _user=Depends(require_admin)):
        now = datetime.now(timezone.utc).isoformat()
        await db.provider_configs.update_one(
            {"provider": config.provider},
            {"$set": {**config.model_dump(), "updated_at": now}},
            upsert=True,
        )
        return {"message": "Provider configuration saved", **config.model_dump()}

    @admin.get("/health")
    async def health(_user=Depends(require_admin)):
        return {"providers": await registry.health()}

    router.include_router(admin)
