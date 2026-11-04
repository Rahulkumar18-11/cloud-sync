from app.db.base import Base
from app.db.session import engine
from app import models  # noqa: F401


def initialize_database() -> None:
    """Create missing application tables for a local development database."""
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    initialize_database()
    print("CloudSync database tables are ready.")
