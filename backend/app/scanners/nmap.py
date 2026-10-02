from dataclasses import dataclass
import ipaddress
import subprocess


class NmapExecutionError(RuntimeError):
    """Raised when Nmap execution fails."""


@dataclass(slots=True)
class NmapScanResult:
    target: str
    stdout: str
    stderr: str
    return_code: int


class NmapRunner:
    """
    Responsible only for executing Nmap.

    Parsing is handled separately by NmapParser.
    """

    def __init__(self, timeout: int = 120):
        self.timeout = timeout

    def scan(self, target: str) -> NmapScanResult:
        self._validate_target(target)

        command = [
            "nmap",
            "-sV",
            "-oX",
            "-",
            target,
        ]

        try:
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=self.timeout,
                check=False,
            )
        except FileNotFoundError as exc:
            raise NmapExecutionError(
                "Nmap is not installed or not available in PATH."
            ) from exc

        except subprocess.TimeoutExpired as exc:
            raise NmapExecutionError(
                f"Nmap scan timed out after {self.timeout} seconds."
            ) from exc

        if result.returncode != 0:
            raise NmapExecutionError(
                f"Nmap failed with exit code {result.returncode}: "
                f"{result.stderr.strip()}"
            )

        return NmapScanResult(
            target=target,
            stdout=result.stdout,
            stderr=result.stderr,
            return_code=result.returncode,
        )

    @staticmethod
    def _validate_target(target: str) -> None:
        if not target or not target.strip():
            raise ValueError("Target cannot be empty.")

        target = target.strip()

        # IP validation
        try:
            ipaddress.ip_address(target)
            return
        except ValueError:
            pass

        # Basic hostname validation
        if len(target) > 253:
            raise ValueError("Target hostname is too long.")

        if target.startswith("-"):
            raise ValueError("Invalid target.")