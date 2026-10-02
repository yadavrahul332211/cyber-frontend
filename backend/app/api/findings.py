from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.parsers.nmap import NmapParser
from app.parsers.nuclei import NucleiParser
from app.schemas.finding import FindingCreate, FindingResponse
from app.schemas.finding_ingest import (
    FindingIngestResponse,
)
from app.services.finding_service import FindingService


router = APIRouter(
    prefix="/findings",
    tags=["Findings"],
)


# ============================================================
# CRUD APIs
# ============================================================

@router.post(
    "",
    response_model=FindingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_finding(
    payload: FindingCreate,
    db: Session = Depends(get_db),
):
    service = FindingService(db)

    return service.create_finding(payload)


@router.get(
    "",
    response_model=list[FindingResponse],
)
def list_findings(
    db: Session = Depends(get_db),
):
    service = FindingService(db)

    return service.list_findings()


@router.get(
    "/{finding_id}",
    response_model=FindingResponse,
)
def get_finding(
    finding_id: int,
    db: Session = Depends(get_db),
):
    service = FindingService(db)

    finding = service.get_finding(finding_id)

    if finding is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finding not found",
        )

    return finding


@router.put(
    "/{finding_id}",
    response_model=FindingResponse,
)
def update_finding(
    finding_id: int,
    payload: FindingCreate,
    db: Session = Depends(get_db),
):
    service = FindingService(db)

    finding = service.update_finding(
        finding_id,
        payload,
    )

    if finding is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finding not found",
        )

    return finding


# ============================================================
# Scanner Ingestion APIs
# ============================================================

@router.post(
    "/ingest/nmap",
    response_model=FindingIngestResponse,
    status_code=status.HTTP_201_CREATED,
)
def ingest_nmap(
    payload: str,
    db: Session = Depends(get_db),
):
    """
    Receive raw Nmap XML output, normalize it,
    and persist findings into PostgreSQL.
    """

    parser = NmapParser()

    try:
        normalized_findings = parser.parse(payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    service = FindingService(db)

    created_findings = service.create_normalized_findings(
        normalized_findings
    )

    return FindingIngestResponse(
        created=len(created_findings),
    )


@router.post(
    "/ingest/nuclei",
    response_model=FindingIngestResponse,
    status_code=status.HTTP_201_CREATED,
)
def ingest_nuclei(
    payload: str,
    db: Session = Depends(get_db),
):
    """
    Receive raw Nuclei JSONL output, normalize it,
    and persist findings into PostgreSQL.
    """

    parser = NucleiParser()

    try:
        normalized_findings = parser.parse(payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    service = FindingService(db)

    created_findings = service.create_normalized_findings(
        normalized_findings
    )

    return FindingIngestResponse(
        created=len(created_findings),
    )