"""
Regression test: schema.sql must declare every column that models.py
defines, per table.

This is the exact bug class that broke `target_company` on
interview_sessions (caught earlier) and `ats_score` on interview_reports
(caught later). Base.metadata.create_all() on app startup only creates
MISSING TABLES -- it never adds a missing column to a table schema.sql
already created. Anyone following the README's documented setup
(`psql -f schema.sql`) gets a table that's silently short a column
models.py expects, and the app crashes with "column does not exist" the
first time it writes there.
"""
import re
from pathlib import Path

from app.core.db import Base
from app.models import models  # noqa: F401  ensure models register on Base.metadata

SCHEMA_SQL_PATH = Path(__file__).resolve().parents[2] / "schema.sql"


def _parse_schema_sql_columns(sql_text: str) -> dict:
    tables = {}
    for match in re.finditer(r"CREATE TABLE (\w+)\s*\((.*?)\n\);", sql_text, re.DOTALL):
        table_name, body = match.group(1), match.group(2)
        columns = set()
        for line in body.splitlines():
            line = line.strip().rstrip(",")
            if not line or line.upper().startswith(
                ("PRIMARY KEY", "FOREIGN KEY", "UNIQUE", "CHECK", "CONSTRAINT")
            ):
                continue
            columns.add(line.split()[0])
        tables[table_name] = columns
    return tables


def test_schema_sql_has_every_model_column():
    schema_text = SCHEMA_SQL_PATH.read_text()
    declared = _parse_schema_sql_columns(schema_text)

    missing = {}
    for table in Base.metadata.sorted_tables:
        expected_cols = {c.name for c in table.columns}
        gap = expected_cols - declared.get(table.name, set())
        if gap:
            missing[table.name] = gap

    assert not missing, f"schema.sql missing columns present in models.py: {missing}"