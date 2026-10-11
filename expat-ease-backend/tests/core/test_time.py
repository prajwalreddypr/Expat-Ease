from datetime import datetime, timedelta, timezone

from app.core.time import as_utc, utc_now


def test_utc_now_returns_timezone_aware_utc_datetime():
    current_time = utc_now()

    assert current_time.tzinfo is not None
    assert current_time.utcoffset() == timedelta(0)


def test_as_utc_adds_utc_to_legacy_naive_datetime():
    legacy_time = datetime(2026, 10, 11, 21, 11, 22)

    normalized_time = as_utc(legacy_time)

    assert normalized_time.tzinfo is timezone.utc
    assert normalized_time.replace(tzinfo=None) == legacy_time
