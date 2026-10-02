from sqlalchemy.orm import Session

from app.models.asset import Asset
from app.repositories.asset_repository import AssetRepository
from app.schemas.asset import AssetCreate, AssetUpdate


class AssetService:

    def __init__(self, db: Session):
        self.db = db
        self.repository = AssetRepository(db)

    def create_asset(self, data: AssetCreate) -> Asset:
        try:
            asset = self.repository.create(data)

            self.db.commit()
            self.db.refresh(asset)

            return asset

        except Exception:
            self.db.rollback()
            raise

    def get_asset(self, asset_id: int) -> Asset | None:
        return self.repository.get_by_id(asset_id)

    def list_assets(self) -> list[Asset]:
        return self.repository.list_all()

    def update_asset(
        self,
        asset_id: int,
        data: AssetUpdate,
    ) -> Asset | None:

        asset = self.repository.get_by_id(asset_id)

        if asset is None:
            return None

        try:
            asset = self.repository.update(
                asset,
                data,
            )

            self.db.commit()
            self.db.refresh(asset)

            return asset

        except Exception:
            self.db.rollback()
            raise