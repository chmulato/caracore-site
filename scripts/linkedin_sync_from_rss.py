#!/usr/bin/env python3
"""Sync the latest publication from one or more RSS feeds to LinkedIn.

This script reads the newest item across one or more RSS feeds and publishes it
to LinkedIn using the UGC API. It also checks recent LinkedIn posts to avoid
duplicate publication of the same article URL.

Required env vars:
- LINKEDIN_ACCESS_TOKEN
- LINKEDIN_AUTHOR_URN (e.g. urn:li:organization:123456)

Optional env vars:
- BLOG_RSS_PATHS (default: personal/feed.xml,sala/redes/retro/feed.xml)
- LINKEDIN_MAX_RECENT_CHECK (default: 10)
- LINKEDIN_POST_PREFIX (default: "Nova publicacao sincronizada da Cara Core")
- LINKEDIN_POST_HASHTAGS (default: "#CaraCore #Tecnologia #SoftwareEngineering")
- DRY_RUN (default: false)
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from email.utils import parsedate_to_datetime
from pathlib import Path
from datetime import datetime, timezone


@dataclass
class RssItem:
    title: str
    link: str
    guid: str
    pub_date: datetime
    source_title: str
    source_path: str


def env_bool(name: str, default: bool = False) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def get_required_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def parse_rss_datetime(raw: str | None) -> datetime:
    if not raw:
        return datetime.min.replace(tzinfo=timezone.utc)
    parsed = parsedate_to_datetime(raw)
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed


def read_latest_rss_item(rss_path: Path) -> RssItem:
    if not rss_path.is_file():
        raise FileNotFoundError(f"RSS file not found: {rss_path}")

    tree = ET.parse(rss_path)
    root = tree.getroot()

    channel = root.find("channel")
    if channel is None:
        raise RuntimeError("Invalid RSS format: <channel> not found")

    item = channel.find("item")
    if item is None:
        raise RuntimeError("No items found in RSS feed")

    source_title = (channel.findtext("title") or rss_path.stem).strip()
    title = (item.findtext("title") or "").strip()
    link = (item.findtext("link") or "").strip()
    guid = (item.findtext("guid") or link).strip()
    pub_date = parse_rss_datetime(item.findtext("pubDate"))

    if not title or not link:
        raise RuntimeError("RSS item missing required title/link")

    return RssItem(
        title=title,
        link=link,
        guid=guid,
        pub_date=pub_date,
        source_title=source_title,
        source_path=str(rss_path).replace("\\", "/"),
    )


def read_latest_item_from_feeds(rss_paths: list[Path]) -> RssItem:
    if not rss_paths:
        raise RuntimeError("No RSS feeds configured")

    items = [read_latest_rss_item(path) for path in rss_paths]
    return max(items, key=lambda item: item.pub_date)


def parse_rss_paths() -> list[Path]:
    raw = os.getenv(
        "BLOG_RSS_PATHS",
        "personal/feed.xml,sala/redes/retro/feed.xml",
    )
    paths = [Path(part.strip()) for part in raw.split(",") if part.strip()]
    if not paths:
        raise RuntimeError("BLOG_RSS_PATHS is empty")
    return paths


def linkedin_request(
    url: str,
    method: str,
    token: str,
    payload: dict | None = None,
) -> tuple[int, dict]:
    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")

    req = urllib.request.Request(url=url, method=method, data=data)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("X-Restli-Protocol-Version", "2.0.0")
    req.add_header("Content-Type", "application/json")

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8") if resp.length != 0 else "{}"
            return resp.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as exc:
        err_body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(
            f"LinkedIn API error {exc.code}: {err_body}"
        ) from exc


def fetch_recent_posts(token: str, author_urn: str, count: int) -> list[dict]:
    encoded_author = urllib.parse.quote(author_urn, safe="")
    url = (
        "https://api.linkedin.com/v2/ugcPosts"
        f"?q=authors&authors=List({encoded_author})&count={count}"
    )
    status, data = linkedin_request(url=url, method="GET", token=token)
    if status != 200:
        raise RuntimeError(f"Unexpected status when fetching recent posts: {status}")
    return data.get("elements", [])


def post_contains_url(post: dict, url: str) -> bool:
    specific = post.get("specificContent", {}).get("com.linkedin.ugc.ShareContent", {})
    commentary = specific.get("shareCommentary", {}).get("text", "")
    if url in commentary:
        return True

    media_list = specific.get("media", [])
    for media in media_list:
        if media.get("originalUrl") == url:
            return True
    return False


def already_published(token: str, author_urn: str, article_url: str, max_recent: int) -> bool:
    posts = fetch_recent_posts(token=token, author_urn=author_urn, count=max_recent)
    return any(post_contains_url(post, article_url) for post in posts)


def build_post_text(item: RssItem) -> str:
    prefix = os.getenv("LINKEDIN_POST_PREFIX", "Nova publicacao sincronizada da Cara Core").strip()
    hashtags = os.getenv(
        "LINKEDIN_POST_HASHTAGS",
        "#CaraCore #Tecnologia #SoftwareEngineering",
    ).strip()

    return (
        f"{prefix}\n\n"
        f"Fonte: {item.source_title}\n"
        f"{item.title}\n"
        f"{item.link}\n\n"
        f"{hashtags}"
    ).strip()


def publish_post(token: str, author_urn: str, item: RssItem) -> str:
    post_text = build_post_text(item)

    payload = {
        "author": author_urn,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {"text": post_text},
                "shareMediaCategory": "ARTICLE",
                "media": [
                    {
                        "status": "READY",
                        "originalUrl": item.link,
                        "title": {"text": item.title},
                    }
                ],
            }
        },
        "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
    }

    status, data = linkedin_request(
        url="https://api.linkedin.com/v2/ugcPosts",
        method="POST",
        token=token,
        payload=payload,
    )

    if status not in {200, 201}:
        raise RuntimeError(f"Unexpected status when posting to LinkedIn: {status}")

    return data.get("id", "(id not returned)")


def main() -> int:
    try:
        dry_run = env_bool("DRY_RUN", default=False)
        rss_paths = parse_rss_paths()
        item = read_latest_item_from_feeds(rss_paths)

        print(f"[linkedin-sync] Latest RSS item: {item.title}")
        print(f"[linkedin-sync] URL: {item.link}")
        print(f"[linkedin-sync] Source: {item.source_title} ({item.source_path})")

        if dry_run:
            print("[linkedin-sync] DRY_RUN enabled; skipping LinkedIn API calls.")
            print("[linkedin-sync] Generated post text:")
            print(build_post_text(item))
            return 0

        token = get_required_env("LINKEDIN_ACCESS_TOKEN")
        author_urn = get_required_env("LINKEDIN_AUTHOR_URN")
        max_recent = int(os.getenv("LINKEDIN_MAX_RECENT_CHECK", "10"))

        if already_published(
            token=token,
            author_urn=author_urn,
            article_url=item.link,
            max_recent=max_recent,
        ):
            print("[linkedin-sync] Post already published on LinkedIn. Skipping.")
            return 0

        post_id = publish_post(token=token, author_urn=author_urn, item=item)
        print(f"[linkedin-sync] Published successfully. LinkedIn post id: {post_id}")
        return 0

    except Exception as exc:
        print(f"[linkedin-sync] ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
