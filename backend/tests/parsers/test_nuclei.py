from pathlib import Path

import pytest

from app.parsers.nuclei import NucleiParser
from app.schemas.finding import Severity


FIXTURE = Path(
    "tests/fixtures/nuclei_sample.jsonl"
)


def test_nuclei_parser_returns_findings():
    data = FIXTURE.read_text()

    findings = NucleiParser().parse(data)

    assert len(findings) == 2


def test_nuclei_source_is_set():
    data = FIXTURE.read_text()

    findings = NucleiParser().parse(data)

    assert all(
        finding.source.value == "nuclei"
        for finding in findings
    )


def test_high_severity_is_normalized():
    data = FIXTURE.read_text()

    findings = NucleiParser().parse(data)

    finding = next(
        finding
        for finding in findings
        if finding.title == "Exposed Git Config"
    )

    assert finding.severity == Severity.HIGH


def test_port_is_preserved_in_evidence():
    data = FIXTURE.read_text()

    findings = NucleiParser().parse(data)

    finding = next(
        finding
        for finding in findings
        if finding.title == "Exposed Git Config"
    )

    assert "Port: 80" in finding.evidence


def test_invalid_json_raises_error():
    parser = NucleiParser()

    with pytest.raises(ValueError):
        parser.parse('{"invalid":')