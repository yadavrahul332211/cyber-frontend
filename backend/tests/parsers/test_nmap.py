from pathlib import Path

import pytest

from app.parsers.nmap import NmapParser
from app.schemas.finding import Severity


FIXTURE = Path(
    "tests/fixtures/nmap_sample.xml"
)


def test_nmap_parser_returns_findings():
    xml = FIXTURE.read_text()

    parser = NmapParser()

    findings = parser.parse(xml)

    assert len(findings) == 3


def test_nmap_asset_is_extracted():
    xml = FIXTURE.read_text()

    findings = NmapParser().parse(xml)

    assert all(
        finding.asset == "192.168.1.10"
        for finding in findings
    )


def test_ssh_finding_is_medium():
    xml = FIXTURE.read_text()

    findings = NmapParser().parse(xml)

    ssh_finding = next(
        finding
        for finding in findings
        if "Port: 22" in finding.evidence
    )

    assert ssh_finding.severity == Severity.MEDIUM


def test_risky_port_is_high():
    xml = FIXTURE.read_text()

    findings = NmapParser().parse(xml)

    smb_finding = next(
        finding
        for finding in findings
        if "Port: 445" in finding.evidence
    )

    assert smb_finding.severity == Severity.HIGH


def test_invalid_xml_raises_error():
    parser = NmapParser()

    with pytest.raises(ValueError):
        parser.parse("<invalid>")