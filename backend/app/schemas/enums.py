from enum import Enum


class Severity(str, Enum):
    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class FindingType(str, Enum):
    WEB = "web"
    SERVER = "server"
    NETWORK = "network"
    HOST = "host"
    OTHER = "other"


class FindingSource(str, Enum):
    NMAP = "nmap"
    NUCLEI = "nuclei"


class FindingStatus(str, Enum):
    OPEN = "open"
    RESOLVED = "resolved"
    IGNORED = "ignored"