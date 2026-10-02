import pytest
from pydantic import ValidationError

from app.schemas.finding import (
    FindingCreate,
    FindingSource,
    FindingStatus,
    FindingType,
    Severity,
)


def test_valid_finding():
    finding = FindingCreate(
        asset="example.com",
        type=FindingType.WEB,
        source=FindingSource.NUCLEI,
        title="Missing Security Header",
        severity=Severity.MEDIUM,
        evidence="X-Frame-Options header is missing",
        status=FindingStatus.OPEN,
    )

    assert finding.asset == "example.com"
    assert finding.type == FindingType.WEB
    assert finding.source == FindingSource.NUCLEI
    assert finding.severity == Severity.MEDIUM
    assert finding.status == FindingStatus.OPEN


def test_status_defaults_to_open():
    finding = FindingCreate(
        asset="example.com",
        type=FindingType.WEB,
        source=FindingSource.NUCLEI,
        title="Missing Security Header",
        severity=Severity.MEDIUM,
        evidence="Header missing",
    )

    assert finding.status == FindingStatus.OPEN


def test_invalid_severity():
    with pytest.raises(ValidationError):
        FindingCreate(
            asset="example.com",
            type=FindingType.WEB,
            source=FindingSource.NUCLEI,
            title="Test",
            severity="unknown",
            evidence="test",
        )


def test_invalid_source():
    with pytest.raises(ValidationError):
        FindingCreate(
            asset="example.com",
            type=FindingType.WEB,
            source="unknown",
            title="Test",
            severity=Severity.LOW,
            evidence="test",
        )