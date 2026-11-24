"""Why create_all is not a migration, and a minimal numbered-migration runner.

    uv run --python 3.13 --with 'sqlalchemy==2.0.*' python p05_migrate.py create_all
    uv run --python 3.13 --with 'sqlalchemy==2.0.*' python p05_migrate.py migrate

Set DATABASE_URL to a scratch file. Real projects use Alembic, which is this
same idea plus autogeneration and downgrades.
"""

import os
import sys

from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

engine = create_engine(os.environ.get("DATABASE_URL", "sqlite:///migrate_demo.db"))


class V1(DeclarativeBase):
    pass


class V2(DeclarativeBase):
    pass


class CaseV1(V1):  # the table as shipped last month
    __tablename__ = "cases"
    case_id: Mapped[str] = mapped_column(primary_key=True)
    title: Mapped[str]


class CaseV2(V2):  # the model as edited today: one new column
    __tablename__ = "cases"
    case_id: Mapped[str] = mapped_column(primary_key=True)
    title: Mapped[str]
    priority: Mapped[int] = mapped_column(default=3)


def create_all_demo() -> None:
    V1.metadata.create_all(engine)  # first deploy
    V2.metadata.create_all(engine)  # next deploy: the table exists, so: nothing
    print("create_all: no error, no change")
    try:
        with Session(engine) as session:
            session.add(CaseV2(case_id="C-1", title="Missing ring"))
            session.commit()
    except OperationalError as exc:
        print("first insert:", exc.orig)


MIGRATIONS = [
    (1, "create cases", "CREATE TABLE cases (case_id TEXT PRIMARY KEY, title TEXT NOT NULL)"),
    (2, "add priority", "ALTER TABLE cases ADD COLUMN priority INTEGER NOT NULL DEFAULT 3"),
]


def migrate() -> None:
    with engine.begin() as conn:
        conn.execute(text("CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY)"))
    for version, name, sql in MIGRATIONS:
        with engine.begin() as conn:  # one transaction per migration
            done = conn.execute(
                text("SELECT 1 FROM schema_migrations WHERE version = :v"), {"v": version}
            ).first()
            if done:
                print(f"{version} {name}: already applied")
                continue
            conn.execute(text(sql))
            conn.execute(text("INSERT INTO schema_migrations VALUES (:v)"), {"v": version})
            print(f"{version} {name}: applied")


if __name__ == "__main__":
    {"create_all": create_all_demo, "migrate": migrate}[sys.argv[1]]()
