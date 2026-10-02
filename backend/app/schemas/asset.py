from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AssetCreate(BaseModel):
    name: str
    type: str
    url: str | None = None
    ip: str | None = None


class AssetUpdate(BaseModel):
    name: str
    type: str
    url: str | None = None
    ip: str | None = None


class AssetResponse(BaseModel):
    id: int
    name: str
    type: str
    url: str | None
    ip: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)