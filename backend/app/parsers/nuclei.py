import json

from app.parsers.base import BaseParser
from app.schemas.enums import FindingSource, FindingStatus, FindingType, Severity
from app.schemas.normalized_finding import NormalizedFinding


class NucleiParser(BaseParser[NormalizedFinding]):
    scanner_name = "nuclei"

    def parse(self, data: str) -> list[NormalizedFinding]:
        if not data or not data.strip():
            return []

        findings: list[NormalizedFinding] = []

        for line_number, line in enumerate(data.splitlines(), start=1):
            line = line.strip()

            if not line:
                continue

            try:
                result = json.loads(line)
            except json.JSONDecodeError as exc:
                raise ValueError(
                    f"Invalid Nuclei JSON on line {line_number}"
                ) from exc

            finding = self._normalize(result)

            if finding is not None:
                findings.append(finding)

        return findings

    def _normalize(self, result: dict) -> NormalizedFinding | None:
        info = result.get("info") or {}

        title = info.get("name")

        if not title:
            return None

        asset = (
            result.get("host")
            or result.get("matched-at")
            or result.get("ip")
        )

        if not asset:
            return None

        severity = self._normalize_severity(
            info.get("severity", "info")
        )

        evidence = self._build_evidence(result)

        return NormalizedFinding(
            asset=str(asset),
            type=FindingType.WEB,
            source=FindingSource.NUCLEI,
            title=str(title),
            severity=severity,
            evidence=evidence,
            status=FindingStatus.OPEN,
        )

    @staticmethod
    def _normalize_severity(value: str) -> Severity:
        value = str(value).lower().strip()

        mapping = {
            "info": Severity.INFO,
            "low": Severity.LOW,
            "medium": Severity.MEDIUM,
            "high": Severity.HIGH,
            "critical": Severity.CRITICAL,
        }

        return mapping.get(value, Severity.INFO)

    @staticmethod
    def _build_evidence(result: dict) -> str:
        evidence_parts: list[str] = []

        host = result.get("host")
        matched_at = result.get("matched-at")
        ip = result.get("ip")
        port = result.get("port")

        if host:
            evidence_parts.append(f"Host: {host}")

        if matched_at:
            evidence_parts.append(f"Matched-At: {matched_at}")

        if ip:
            evidence_parts.append(f"IP: {ip}")

        if port:
            evidence_parts.append(f"Port: {port}")

        info = result.get("info") or {}

        description = info.get("description")

        if description:
            evidence_parts.append(f"Description: {description}")

        remediation = info.get("remediation")

        if remediation:
            evidence_parts.append(f"Remediation: {remediation}")

        return ", ".join(evidence_parts)