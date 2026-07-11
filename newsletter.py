"""Core newsletter management module.

Provides subscriber management and issue sending for a simple
email newsletter. Subscribers are persisted to a JSON file so the
module works out of the box with no database required.

Usage:
    from newsletter import Newsletter

    nl = Newsletter("My Weekly Digest")
    nl.subscribe("reader@example.com", name="Alex")
    nl.send_issue(
        subject="Issue #1",
        body="Welcome to the first issue!",
        smtp_host="localhost",
    )
"""

from __future__ import annotations

import json
import re
import smtplib
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from email.message import EmailMessage
from pathlib import Path

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


@dataclass
class Subscriber:
    email: str
    name: str = ""
    subscribed_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    active: bool = True


class Newsletter:
    """Manages a subscriber list and sends newsletter issues."""

    def __init__(self, title: str, storage_path: str | Path = "subscribers.json"):
        self.title = title
        self.storage_path = Path(storage_path)
        self._subscribers: dict[str, Subscriber] = {}
        self._load()

    # ---------------------------------------------------------------- storage

    def _load(self) -> None:
        if self.storage_path.exists():
            data = json.loads(self.storage_path.read_text())
            self._subscribers = {
                entry["email"]: Subscriber(**entry) for entry in data
            }

    def _save(self) -> None:
        data = [asdict(sub) for sub in self._subscribers.values()]
        self.storage_path.write_text(json.dumps(data, indent=2))

    # ------------------------------------------------------------ subscribers

    def subscribe(self, email: str, name: str = "") -> Subscriber:
        """Add a subscriber, or reactivate them if they previously left."""
        email = email.strip().lower()
        if not EMAIL_RE.match(email):
            raise ValueError(f"Invalid email address: {email!r}")

        existing = self._subscribers.get(email)
        if existing:
            existing.active = True
            if name:
                existing.name = name
            subscriber = existing
        else:
            subscriber = Subscriber(email=email, name=name)
            self._subscribers[email] = subscriber

        self._save()
        return subscriber

    def unsubscribe(self, email: str) -> bool:
        """Deactivate a subscriber. Returns True if they were active."""
        subscriber = self._subscribers.get(email.strip().lower())
        if subscriber and subscriber.active:
            subscriber.active = False
            self._save()
            return True
        return False

    @property
    def active_subscribers(self) -> list[Subscriber]:
        return [s for s in self._subscribers.values() if s.active]

    # ----------------------------------------------------------------- sending

    def send_issue(
        self,
        subject: str,
        body: str,
        smtp_host: str,
        smtp_port: int = 587,
        sender: str = "newsletter@example.com",
        username: str | None = None,
        password: str | None = None,
    ) -> int:
        """Send an issue to all active subscribers.

        Returns the number of emails sent. Credentials, if given,
        are used to authenticate over STARTTLS.
        """
        recipients = self.active_subscribers
        if not recipients:
            return 0

        with smtplib.SMTP(smtp_host, smtp_port) as smtp:
            if username and password:
                smtp.starttls()
                smtp.login(username, password)

            sent = 0
            for subscriber in recipients:
                msg = EmailMessage()
                msg["Subject"] = f"{self.title}: {subject}"
                msg["From"] = sender
                msg["To"] = subscriber.email
                greeting = f"Hi {subscriber.name}," if subscriber.name else "Hi,"
                msg.set_content(f"{greeting}\n\n{body}")
                smtp.send_message(msg)
                sent += 1

        return sent


if __name__ == "__main__":
    nl = Newsletter("Demo Newsletter", storage_path="subscribers.json")
    nl.subscribe("demo@example.com", name="Demo Reader")
    print(f"{nl.title}: {len(nl.active_subscribers)} active subscriber(s)")
