import argparse
import datetime as dt
import email.utils
from html.parser import HTMLParser
from pathlib import Path
from typing import List, Dict, Optional


CYCLE_START_DATE = dt.datetime(2026, 6, 4, tzinfo=dt.timezone.utc)


class RetroArticlesParser(HTMLParser):
    """Parser para sala/redes/retro/articles.html.

    Estrutura alvo:
      <div class="year-title">2026</div>
      ...
      <li class="article-item" ...>
          <span class="article-date">23/05</span>
          <a class="article-title" href="articles/2026_05_23_article_86.html">Título</a>
      </li>
    """

    def __init__(self) -> None:
        super().__init__()
        self.current_year: Optional[int] = None
        self._in_year_title = False
        self._in_article_li = False
        self._in_date_span = False
        self._in_title_a = False
        self._current_item: Optional[Dict[str, str]] = None
        self.items: List[Dict[str, str]] = []

    def handle_starttag(self, tag: str, attrs):
        attrs_dict = {k: v for k, v in attrs}
        class_attr = attrs_dict.get("class", "")

        if tag == "div" and "year-title" in class_attr.split():
            self._in_year_title = True
            return

        if tag == "li" and "article-item" in class_attr.split():
            self._in_article_li = True
            self._current_item = {"year": str(self.current_year or ""), "date": "", "href": "", "title": ""}
            return

        if not self._in_article_li or self._current_item is None:
            return

        if tag == "span" and "article-date" in class_attr.split():
            self._in_date_span = True
            return

        if tag == "a" and "article-title" in class_attr.split():
            self._in_title_a = True
            href = attrs_dict.get("href", "")
            self._current_item["href"] = href

    def handle_endtag(self, tag: str):
        if tag == "div" and self._in_year_title:
            self._in_year_title = False
            return

        if tag == "span" and self._in_date_span:
            self._in_date_span = False
            return

        if tag == "a" and self._in_title_a:
            self._in_title_a = False
            return

        if tag == "li" and self._in_article_li:
            # Finaliza item atual
            if self._current_item and self._current_item.get("href"):
                self._current_item["title"] = " ".join(self._current_item["title"].split())
                self._current_item["date"] = self._current_item["date"].strip()
                self.items.append(self._current_item)

            self._current_item = None
            self._in_article_li = False

    def handle_data(self, data: str):
        text = data.strip()
        if not text:
            return

        if self._in_year_title:
            # Espera algo como "2026"
            try:
                self.current_year = int("".join(ch for ch in text if ch.isdigit()))
            except ValueError:
                self.current_year = None
            return

        if self._in_article_li and self._current_item is not None:
            if self._in_date_span:
                # Datas vêm como "23/05"
                if self._current_item["date"]:
                    self._current_item["date"] += " "
                self._current_item["date"] += text
            elif self._in_title_a:
                if self._current_item["title"]:
                    self._current_item["title"] += " "
                self._current_item["title"] += text


class PersonalArticlesParser(HTMLParser):
    """Parser para personal/index.html.

    Estrutura alvo:
      <article class="article-card" ...>
        <span class="date">21/08/2026</span>
        ...
        <h3/4 class="article-title"><a href="articles/...html">Título</a></h3/4>
    """

    def __init__(self) -> None:
        super().__init__()
        self._in_article = False
        self._in_date_span = False
        self._in_title_header = False
        self._in_title_a = False
        self._current_item: Optional[Dict[str, str]] = None
        self.items: List[Dict[str, str]] = []

    def handle_starttag(self, tag: str, attrs):
        attrs_dict = {k: v for k, v in attrs}
        class_attr = attrs_dict.get("class", "")

        if tag == "article" and "article-card" in class_attr.split():
            self._in_article = True
            self._current_item = {"date": "", "href": "", "title": ""}
            return

        if not self._in_article or self._current_item is None:
            return

        if tag == "span" and "date" in class_attr.split():
            self._in_date_span = True
            return

        if tag in ("h3", "h4") and "article-title" in class_attr.split():
            self._in_title_header = True
            return

        if self._in_title_header and tag == "a":
            self._in_title_a = True
            href = attrs_dict.get("href", "")
            self._current_item["href"] = href

    def handle_endtag(self, tag: str):
        if tag == "span" and self._in_date_span:
            self._in_date_span = False
            return

        if tag in ("h3", "h4") and self._in_title_header:
            self._in_title_header = False
            return

        if tag == "a" and self._in_title_a:
            self._in_title_a = False
            return

        if tag == "article" and self._in_article:
            if self._current_item and self._current_item.get("href"):
                self._current_item["title"] = " ".join(self._current_item["title"].split())
                self._current_item["date"] = self._current_item["date"].strip()
                self.items.append(self._current_item)

            self._current_item = None
            self._in_article = False

    def handle_data(self, data: str):
        text = data.strip()
        if not text or not self._in_article or self._current_item is None:
            return

        if self._in_date_span:
            if self._current_item["date"]:
                self._current_item["date"] += " "
            self._current_item["date"] += text
        elif self._in_title_a:
            if self._current_item["title"]:
                self._current_item["title"] += " "
            self._current_item["title"] += text


def parse_retro_articles(html_text: str) -> List[Dict]:
    parser = RetroArticlesParser()
    parser.feed(html_text)
    items: List[Dict] = []

    for raw in parser.items:
        year_str = raw.get("year", "").strip()
        date_str = raw.get("date", "").split()[0] if raw.get("date") else ""
        title = raw.get("title", "").strip()
        href = raw.get("href", "").strip()

        parsed_date: Optional[dt.datetime] = None
        if year_str and date_str:
            try:
                day_str, month_str = date_str.split("/")
                parsed_date = dt.datetime(
                    int(year_str),
                    int(month_str),
                    int(day_str),
                    0,
                    0,
                    tzinfo=dt.timezone.utc,
                )
            except Exception:
                parsed_date = None

        items.append({
            "title": title,
            "href": href,
            "date": parsed_date,
        })

    return items


def parse_personal_articles(html_text: str) -> List[Dict]:
    parser = PersonalArticlesParser()
    parser.feed(html_text)
    items: List[Dict] = []

    for raw in parser.items:
        date_str = raw.get("date", "").split()[0] if raw.get("date") else ""
        title = raw.get("title", "").strip()
        href = raw.get("href", "").strip()

        parsed_date: Optional[dt.datetime] = None
        if date_str:
            try:
                # Formato esperado: DD/MM/AAAA
                day_str, month_str, year_str = date_str.split("/")
                parsed_date = dt.datetime(
                    int(year_str),
                    int(month_str),
                    int(day_str),
                    0,
                    0,
                    tzinfo=dt.timezone.utc,
                )
            except Exception:
                parsed_date = None

        items.append({
            "title": title,
            "href": href,
            "date": parsed_date,
        })

    return items


def format_rfc2822(d: dt.datetime) -> str:
    return email.utils.format_datetime(d)


def normalize_as_of_date(as_of_date: Optional[str]) -> dt.datetime:
    if not as_of_date:
        now = dt.datetime.now(dt.timezone.utc)
        return dt.datetime(now.year, now.month, now.day, 0, 0, tzinfo=dt.timezone.utc)

    parsed = dt.datetime.strptime(as_of_date, "%Y-%m-%d")
    return dt.datetime(parsed.year, parsed.month, parsed.day, 0, 0, tzinfo=dt.timezone.utc)


def filter_items_for_feed(items: List[Dict], today: dt.datetime) -> List[Dict]:
    filtered = [item for item in items if item.get("date") and item["date"] <= today]

    if today >= CYCLE_START_DATE:
        filtered = [item for item in filtered if item["date"] >= CYCLE_START_DATE]

    return filtered


def build_rss(channel: Dict[str, str], items: List[Dict], base_url: str, as_of_date: Optional[dt.datetime] = None) -> str:
    # Ordena itens por data (mais recente primeiro), mantendo sem data no final
    dated = [it for it in items if isinstance(it.get("date"), dt.datetime)]
    undated = [it for it in items if not isinstance(it.get("date"), dt.datetime)]
    dated.sort(key=lambda it: it["date"], reverse=True)
    ordered = dated + undated

    # lastBuildDate = as_of_date quando fornecida, senão data do item mais recente
    last_build = as_of_date or (dated[0]["date"] if dated else dt.datetime.now(dt.timezone.utc))
    last_build_str = format_rfc2822(last_build)

    lines: List[str] = []
    lines.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>")
    lines.append("<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\">")
    lines.append("  <channel>")
    lines.append(f"    <title><![CDATA[{channel['title']}]]></title>")
    lines.append(f"    <link>{channel['link']}</link>")
    lines.append(f"    <description><![CDATA[{channel['description']}]]></description>")
    lines.append(f"    <language>{channel.get('language', 'pt-BR')}</language>")
    lines.append(f"    <lastBuildDate>{last_build_str}</lastBuildDate>")
    if channel.get("self_link"):
        lines.append(f"    <atom:link href=\"{channel['self_link']}\" rel=\"self\" type=\"application/rss+xml\" />")
    lines.append(f"    <generator>{channel.get('generator', 'Cara Core RSS generator')}</generator>")
    lines.append("")

    for it in ordered:
        title = it.get("title", "").strip()
        href = it.get("href", "").strip()
        full_link = href
        if href and not href.startswith("http"):
            # Garante barra entre base_url e href
            if not base_url.endswith("/") and not href.startswith("/"):
                full_link = base_url + "/" + href
            else:
                full_link = base_url + href

        pub = it.get("date")
        pub_str = format_rfc2822(pub) if isinstance(pub, dt.datetime) else None

        lines.append("    <item>")
        lines.append(f"      <title><![CDATA[{title}]]></title>")
        lines.append(f"      <link>{full_link}</link>")
        lines.append(f"      <guid isPermaLink=\"true\">{full_link}</guid>")
        if pub_str:
            lines.append(f"      <pubDate>{pub_str}</pubDate>")
        lines.append("    </item>")

    lines.append("")
    lines.append("  </channel>")
    lines.append("</rss>")

    return "\n".join(lines) + "\n"


def generate_mode_retro(root: Path, today: dt.datetime) -> None:
    html_path = root / "sala" / "redes" / "retro" / "articles.html"
    fallback_html_path = root / "sala" / "redes" / "retro" / "index.html"
    output_path = root / "sala" / "redes" / "retro" / "feed.xml"

    text = html_path.read_text(encoding="utf-8")
    if "article-item" not in text and fallback_html_path.exists():
        text = fallback_html_path.read_text(encoding="utf-8")

    items = parse_retro_articles(text)

    items = filter_items_for_feed(items, today)

    channel = {
        "title": "Artigos Retrô — Cara Core Informática",
        "link": "https://www.caracore.com.br/sala/redes/retro/articles.html",
        "self_link": "https://www.caracore.com.br/sala/redes/retro/feed.xml",
        "description": "Coleção de artigos publicados pela Cara Core nas redes, organizada por ano.",
        "language": "pt-BR",
        "generator": "Cara Core RSS generator",
    }

    rss = build_rss(channel, items, base_url="https://www.caracore.com.br/sala/redes/retro/", as_of_date=today)
    output_path.write_text(rss, encoding="utf-8")


def generate_mode_personal(root: Path, today: dt.datetime) -> None:
    html_path = root / "personal" / "index.html"
    output_path = root / "personal" / "feed.xml"

    text = html_path.read_text(encoding="utf-8")
    items = parse_personal_articles(text)

    items = filter_items_for_feed(items, today)

    channel = {
        "title": "Christian Mulato Dev Blog",
        "link": "https://personal.caracore.com.br/",
        "self_link": "https://personal.caracore.com.br/feed.xml",
        "description": "Artigos técnicos sobre desenvolvimento Java, arquitetura de software e tecnologia.",
        "language": "pt-BR",
        "generator": "Cara Core RSS generator",
    }

    rss = build_rss(channel, items, base_url="https://personal.caracore.com.br/", as_of_date=today)
    output_path.write_text(rss, encoding="utf-8")


def main(argv: Optional[List[str]] = None) -> None:
    parser = argparse.ArgumentParser(description="Gerador de feeds RSS para páginas HTML estáticas da Cara Core.")
    parser.add_argument(
        "--mode",
        choices=["retro", "personal", "both"],
        default="retro",
        help="Qual feed gerar: 'retro' (sala/redes/retro), 'personal' ou 'both'",
    )
    parser.add_argument(
        "--as-of-date",
        help="Data de referência para geração no formato YYYY-MM-DD. Itens futuros a essa data são ignorados.",
    )

    args = parser.parse_args(argv)
    today = normalize_as_of_date(args.as_of_date)

    # Raiz do repositório (pasta acima de scripts/)
    root = Path(__file__).resolve().parents[1]

    if args.mode in ("retro", "both"):
        generate_mode_retro(root, today)

    if args.mode in ("personal", "both"):
        generate_mode_personal(root, today)


if __name__ == "__main__":  # pragma: no cover
    main()
