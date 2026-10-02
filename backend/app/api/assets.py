from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.asset import (
    AssetCreate,
    AssetResponse,
    AssetUpdate,
)
from app.services.asset_service import AssetService


router = APIRouter(
    prefix="/assets",
    tags=["Assets"],
)


@router.post(
    "",
    response_model=AssetResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_asset(
    payload: AssetCreate,
    db: Session = Depends(get_db),
):
    service = AssetService(db)

    return service.create_asset(payload)


@router.get(
    "",
    response_model=list[AssetResponse],
)
def list_assets(
    db: Session = Depends(get_db),
):
    service = AssetService(db)

    return service.list_assets()


@router.get(
    "/{asset_id}",
    response_model=AssetResponse,
)
def get_asset(
    asset_id: int,
    db: Session = Depends(get_db),
):
    service = AssetService(db)

    asset = service.get_asset(asset_id)

    if asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found",
        )

    return asset


@router.put(
    "/{asset_id}",
    response_model=AssetResponse,
)
def update_asset(
    asset_id: int,
    payload: AssetUpdate,
    db: Session = Depends(get_db),
):
    service = AssetService(db)

    asset = service.update_asset(
        asset_id,
        payload,
    )

    if asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found",
        )

    return asset