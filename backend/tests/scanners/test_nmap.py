import pytest

from app.scanners.nmap import NmapRunner


def test_empty_target_is_rejected():
    runner = NmapRunner()

    with pytest.raises(ValueError):
        runner.scan("")


def test_whitespace_target_is_rejected():
    runner = NmapRunner()

    with pytest.raises(ValueError):
        runner.scan("   ")


def test_invalid_target_is_rejected():
    runner = NmapRunner()

    with pytest.raises(ValueError):
        runner.scan("-malicious")


def test_long_target_is_rejected():
    runner = NmapRunner()

    target = "a" * 254

    with pytest.raises(ValueError):
        runner.scan(target)


def test_valid_ip_is_accepted(monkeypatch):
    runner = NmapRunner()

    def fake_run(*args, **kwargs):
        class FakeResult:
            returncode = 0
            stdout = "<nmaprun></nmaprun>"
            stderr = ""

        return FakeResult()

    monkeypatch.setattr(
        "app.scanners.nmap.subprocess.run",
        fake_run,
    )

    result = runner.scan("127.0.0.1")

    assert result.target == "127.0.0.1"
    assert result.return_code == 0
    assert "<nmaprun>" in result.stdout