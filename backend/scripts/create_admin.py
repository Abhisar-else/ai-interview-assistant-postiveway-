"""
Create an admin account. Run manually once per environment — replaces the
old auto-seed-on-login behavior (which was a hardcoded-credential backdoor).

Usage:
    cd backend
    python -m scripts.create_admin --email you@company.com --name "Admin" --password "..."

If --password is omitted, you'll be prompted (won't echo to terminal).
"""
import argparse
import getpass
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.db import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.models import Admin


def main():
    parser = argparse.ArgumentParser(description="Create an admin account")
    parser.add_argument("--email", required=True)
    parser.add_argument("--name", default="Admin")
    parser.add_argument("--password", default=None, help="Omit to be prompted securely")
    args = parser.parse_args()

    password = args.password or getpass.getpass("Admin password: ")
    if len(password) < 8:
        print("Password must be at least 8 characters.", file=sys.stderr)
        sys.exit(1)

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(Admin).filter(Admin.email == args.email).first()
        if existing:
            print(f"Admin with email {args.email} already exists (id={existing.id}).", file=sys.stderr)
            sys.exit(1)

        admin = Admin(
            name=args.name,
            email=args.email,
            password_hash=get_password_hash(password),
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print(f"Created admin '{admin.name}' <{admin.email}> (id={admin.id}).")
    finally:
        db.close()


if __name__ == "__main__":
    main()
