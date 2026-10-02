from pydantic import BaseModel, Field

from app.schemas.enums import (
    FindingSource,
    FindingStatus,
    FindingType,
    Severity,
)


class FindingCreate(BaseModel):
    asset: str = Field(min_length=1)
    type: FindingType
    source: FindingSource
    title: str = Field(min_length=1, max_length=255)
    severity: Severity
    evidence: str
    status: FindingStatus = FindingStatus.OPEN


class FindingResponse(FindingCreate):
    id: int