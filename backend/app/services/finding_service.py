from sqlalchemy.orm import Session

from app.models.finding import Finding
from app.repositories.finding_repository import FindingRepository
from app.schemas.finding import FindingCreate
from app.schemas.normalized_finding import NormalizedFinding


class FindingService:

    def __init__(self, db: Session):
        self.db = db
        self.repository = FindingRepository(db)

    def create_finding(self, data: FindingCreate) -> Finding:
        try:
            finding = self.repository.create(data)

            self.db.commit()
            self.db.refresh(finding)

            return finding

        except Exception:
            self.db.rollback()
            raise

    def create_normalized_finding(
        self,
        data: NormalizedFinding,
    ) -> Finding:
        """
        Persist a parser-generated normalized finding.

        Parser output:
            NormalizedFinding

        Database input:
            FindingCreate
        """

        finding_data = FindingCreate(
            asset=data.asset,
            type=data.type,
            source=data.source,
            title=data.title,
            severity=data.severity,
            evidence=data.evidence,
            status=data.status,
        )

        return self.create_finding(finding_data)

    def create_normalized_findings(
        self,
        findings: list[NormalizedFinding],
    ) -> list[Finding]:
        """
        Persist multiple normalized findings in one transaction.
        """

        if not findings:
            return []

        try:
            created_findings: list[Finding] = []

            for normalized in findings:
                finding_data = FindingCreate(
                    asset=normalized.asset,
                    type=normalized.type,
                    source=normalized.source,
                    title=normalized.title,
                    severity=normalized.severity,
                    evidence=normalized.evidence,
                    status=normalized.status,
                )

                finding = self.repository.create(finding_data)
                created_findings.append(finding)

            self.db.commit()

            for finding in created_findings:
                self.db.refresh(finding)

            return created_findings

        except Exception:
            self.db.rollback()
            raise

    def get_finding(self, finding_id: int) -> Finding | None:
        return self.repository.get_by_id(finding_id)

    def list_findings(self) -> list[Finding]:
        return self.repository.list_all()

    def update_finding(
        self,
        finding_id: int,
        data: FindingCreate,
    ) -> Finding | None:

        finding = self.repository.get_by_id(finding_id)

        if finding is None:
            return None

        try:
            finding = self.repository.update(
                finding,
                data,
            )

            self.db.commit()
            self.db.refresh(finding)

            return finding

        except Exception:
            self.db.rollback()
            raise