from sqlalchemy.orm import Session

from app.models.finding import Finding
from app.schemas.finding import FindingCreate


class FindingRepository:

    def __init__(self, db: Session):
        self.db = db

    def create(self, data: FindingCreate) -> Finding:
        finding = Finding(
            asset=data.asset,
            type=data.type.value,
            source=data.source.value,
            title=data.title,
            severity=data.severity.value,
            evidence=data.evidence,
            status=data.status.value,
        )

        self.db.add(finding)
        self.db.flush()

        return finding

    def get_by_id(self, finding_id: int) -> Finding | None:
        return (
            self.db.query(Finding)
            .filter(Finding.id == finding_id)
            .first()
        )

    def list_all(self) -> list[Finding]:
        return (
            self.db.query(Finding)
            .order_by(Finding.id.desc())
            .all()
        )

    def update(
        self,
        finding: Finding,
        data: FindingCreate,
    ) -> Finding:

        finding.asset = data.asset
        finding.type = data.type.value
        finding.source = data.source.value
        finding.title = data.title
        finding.severity = data.severity.value
        finding.evidence = data.evidence
        finding.status = data.status.value

        self.db.flush()

        return finding