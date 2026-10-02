from pydantic import BaseModel


class FindingIngestResponse(BaseModel):
    created: int