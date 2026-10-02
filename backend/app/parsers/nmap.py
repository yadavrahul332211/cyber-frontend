from xml.etree import ElementTree as ET

from app.parsers.base import BaseParser
from app.schemas.enums import FindingSource, FindingStatus, FindingType, Severity
from app.schemas.normalized_finding import NormalizedFinding


class NmapParser(BaseParser[NormalizedFinding]):
    scanner_name = "nmap"

    def parse(self, data: str) -> list[NormalizedFinding]:
        if not data or not data.strip():
            return []

        try:
            root = ET.fromstring(data)
        except ET.ParseError as exc:
            raise ValueError("Invalid Nmap XML output") from exc

        findings: list[NormalizedFinding] = []

        for host in root.findall("host"):
            asset = self._extract_host_address(host)

            if not asset:
                continue

            ports = host.find("ports")

            if ports is None:
                continue

            for port in ports.findall("port"):
                finding = self._parse_port(asset, port)

                if finding is not None:
                    findings.append(finding)

        return findings

    def _parse_port(
        self,
        asset: str,
        port: ET.Element,
    ) -> NormalizedFinding | None:

        state = port.find("state")

        if state is None:
            return None

        if state.get("state") != "open":
            return None

        port_id = port.get("portid", "unknown")
        protocol = port.get("protocol", "unknown")

        service = port.find("service")

        service_name = "unknown"
        product = ""
        version = ""

        if service is not None:
            service_name = service.get("name", "unknown")
            product = service.get("product", "")
            version = service.get("version", "")

        title = f"Open {service_name} service on port {port_id}"

        severity = self._calculate_severity(
            port_id=port_id,
            service_name=service_name,
        )

        evidence_parts = [
            f"Host: {asset}",
            f"Protocol: {protocol}",
            f"Port: {port_id}",
            f"State: open",
            f"Service: {service_name}",
        ]

        if product:
            evidence_parts.append(f"Product: {product}")

        if version:
            evidence_parts.append(f"Version: {version}")

        evidence = ", ".join(evidence_parts)

        return NormalizedFinding(
            asset=asset,
            type=FindingType.SERVER,
            source=FindingSource.NMAP,
            title=title,
            severity=severity,
            evidence=evidence,
            status=FindingStatus.OPEN,
        )

    @staticmethod
    def _extract_host_address(host: ET.Element) -> str | None:
        for address in host.findall("address"):
            addr = address.get("addr")

            if addr:
                return addr

        return None

    @staticmethod
    def _calculate_severity(
        port_id: str,
        service_name: str,
    ) -> Severity:

        high_risk_ports = {
            "21",
            "23",
            "445",
            "3389",
        }

        if port_id in high_risk_ports:
            return Severity.HIGH

        if service_name.lower() == "ssh":
            return Severity.MEDIUM

        return Severity.LOW