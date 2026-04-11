#!/usr/bin/env python3
"""CLI tool for direct SQLite queries against 2Brain database."""

import argparse
import json
import os
import sqlite3
import sys

DEFAULT_DB = os.path.expanduser("~/repos/2Brain/data/brain.sqlite")


def run_query(db_path, sql, params=None, format_output="table"):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(sql, params or [])

    if sql.strip().upper().startswith("SELECT"):
        rows = cursor.fetchall()
        if format_output == "json":
            print(json.dumps([dict(r) for r in rows], indent=2))
        else:
            if rows:
                headers = rows[0].keys()
                print(" | ".join(headers))
                print("-+-".join("-" * 20 for _ in headers))
                for row in rows:
                    print(" | ".join(str(row[h])[:20] for h in headers))
            print(f"\n({len(rows)} rows)")
    else:
        conn.commit()
        print(f"OK — {cursor.rowcount} rows affected")

    conn.close()


def main():
    parser = argparse.ArgumentParser(description="Query 2Brain SQLite database")
    parser.add_argument("sql", help="SQL query to execute")
    parser.add_argument("--db", default=DEFAULT_DB, help=f"Database path (default: {DEFAULT_DB})")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    args = parser.parse_args()

    if not os.path.exists(args.db):
        print(f"Error: database not found at {args.db}", file=sys.stderr)
        sys.exit(1)

    run_query(args.db, args.sql, format_output="json" if args.json else "table")


if __name__ == "__main__":
    main()
