from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[1]
PUBLIC_DIR = BASE_DIR / "public"

INDEX_FILE = PUBLIC_DIR / "index.html"
HTML_PAGES = [
    PUBLIC_DIR / "curriculo-pt.html",
    PUBLIC_DIR / "curriculo-en.html",
    PUBLIC_DIR / "curriculo-it.html",
    PUBLIC_DIR / "perfil-completo.html",
]


def _read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def test_index_points_to_html_pages_only():
    content = _read_text(INDEX_FILE)

    assert "curriculo-pt.html" in content
    assert "curriculo-en.html" in content
    assert "curriculo-it.html" in content
    assert "perfil-completo.html" in content

    assert "resume_last_8_years_pt.json" not in content
    assert "resume_last_8_years_en.json" not in content
    assert "resume_last_8_years_it.json" not in content
    assert "profile_full.json" not in content


def test_resume_html_pages_have_basic_document_structure():
    for page in HTML_PAGES:
        content = _read_text(page)
        lowered = content.lower()

        assert "<!doctype html>" in lowered, f"Missing doctype in {page.name}"
        assert "<html" in lowered, f"Missing html tag in {page.name}"
        assert "<head>" in lowered, f"Missing head tag in {page.name}"
        assert "<body>" in lowered, f"Missing body tag in {page.name}"
        assert "<main" in lowered, f"Missing main tag in {page.name}"
        assert "</html>" in lowered, f"Missing closing html tag in {page.name}"


def test_resume_html_pages_include_navigation_and_renderer():
    for page in HTML_PAGES:
        content = _read_text(page)

        assert '/cv/public/index.html' in content, f"Missing back link in {page.name}"
        assert '/cv/public/js/json-to-html.js' in content, f"Missing renderer script in {page.name}"
        assert 'loadResumeAsHtml({' in content, f"Missing renderer invocation in {page.name}"
