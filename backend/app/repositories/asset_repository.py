from sqlalchemy.orm import Session

from app.models.asset import Asset
from app.schemas.asset import AssetCreate, AssetUpdate


class AssetRepository:

    def __init__(self, db: Session):
        self.db = db

    def create(self, data: AssetCreate) -> Asset:
        asset = Asset(
            name=data.name,
            type=data.type,
            url=data.url,
            ip=data.ip,
        )

        self.db.add(asset)
        self.db.flush()

        return asset

    def get_by_id(self, asset_id: int) -> Asset | None:
        return (
            self.db.query(Asset)
            .filter(Asset.id == asset_id)
            .first()
        )

    def list_all(self) -> list[Asset]:
        return (
            self.db.query(Asset)
            .order_by(Asset.id.desc())
            .all()
        )

    def update(
        self,
        asset: Asset,
        data: AssetUpdate,
    ) -> Asset:

        asset.name = data.name
        asset.type = data.type
        asset.url = data.url
        asset.ip = data.ip

        self.db.flush()

        return asset