from pathlib import Path


MIGRATION_PATH = (
    Path(__file__).resolve().parents[1]
    / "migrations"
    / "20260726_add_interview_report_session_unique.sql"
)


def test_report_session_unique_migration_is_idempotent():
    migration = MIGRATION_PATH.read_text()

    assert "pg_constraint" in migration
    assert "uq_interview_reports_session_id" in migration
    assert "UNIQUE (session_id)" in migration
