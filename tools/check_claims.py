#!/usr/bin/env python3
"""
Consistencia de claims publicas do PDV e do Hub.

Le do codigo (PlanoLicencaService) o limite do plano Free e compara com o que
esta publicado nas lojas, matriz e wiki. Falha se:
  - o numero de vendas publicado divergir do codigo ou nao disser "finalizadas";
  - o teto do Free nao explicar o bloqueio ate o mes seguinte;
  - CBS/IBS aparecer sem "estimado";
  - R$ 79,90 aparecer fora de contexto de Premium/suporte;
  - "sem assinatura" nao disser "digital";
  - pagina do Hub com 79,90 nao publicar SLA de 24 horas;
  - h1/CTA vender "Free" sem qualificacao.

Uso:
  python tools/check_claims.py
Exit code: 0 = OK, 1 = falhas
"""

import glob
import html as htmlmod
import io
import os
import re
import sys

DEV = r"D:\onedrive\dev"
PDV_DOCS = os.path.join(DEV, r"caracore-pdv-releases\docs")
HUB_DOCS = os.path.join(DEV, r"caracore-hub-releases\docs")
PLANO = os.path.join(
    DEV, r"caracore-pdv\pdv-apps\src\main\java\br\com\caracore\pdv\service\PlanoLicencaService.java"
)

PDV_CURRENT = [
    os.path.join(PDV_DOCS, "index.html"),
    os.path.join(PDV_DOCS, "download.html"),
    os.path.join(PDV_DOCS, "consultoria.html"),
    os.path.join(PDV_DOCS, "readme.html"),
    os.path.join(PDV_DOCS, "tecnologia.html"),
    os.path.join(PDV_DOCS, "versoes.html"),
    os.path.join(PDV_DOCS, "pwa.html"),
    os.path.join(PDV_DOCS, "roadmap-2026.html"),
]

HUB_PAGES = [
    os.path.join(DEV, r"caracore-hub-releases\index.html"),
    os.path.join(DEV, r"caracore-hub-releases\download.html"),
    os.path.join(HUB_DOCS, "index.html"),
    os.path.join(HUB_DOCS, "download.html"),
    os.path.join(DEV, r"caracore-loja\docs\download.html"),
    os.path.join(DEV, r"caracore-site\index.html"),
    os.path.join(DEV, r"caracore-site\ecosistema.html"),
    os.path.join(DEV, r"caracore-site\portfolio.html"),
    os.path.join(DEV, r"caracore-wiki\docs\projeto-hub.html"),
]

TAG_RE = re.compile(r"<[^>]+>")
ANCHOR_RE = re.compile(r"<a\b[^>]*>(.*?)</a>", re.S | re.I)
H1_RE = re.compile(r"<h1\b[^>]*>(.*?)</h1>", re.S | re.I)


def read(path):
    with io.open(path, "r", encoding="utf-8", errors="replace") as fh:
        return fh.read()


def plain(fragment):
    return re.sub(r"\s+", " ", htmlmod.unescape(TAG_RE.sub(" ", fragment))).strip()


def fail(errors, path, msg):
    errors.append("%s: %s" % (os.path.relpath(path, DEV), msg))


def limite_vendas():
    text = read(PLANO)
    m = re.search(r"LIMITE_VENDAS_MES_PLANO_FREE\s*=\s*(\d+)", text)
    if not m:
        raise SystemExit("constante LIMITE_VENDAS_MES_PLANO_FREE nao encontrada em %s" % PLANO)
    return int(m.group(1))


def main():
    errors = []
    warnings = []
    limite = limite_vendas()

    # 1) Limite do Free: numero publicado == constante do codigo.
    for path in PDV_CURRENT:
        text = read(path)
        for n in re.findall(r"(\d+)\s*vendas", text):
            if int(n) != limite:
                fail(errors, path, "publica %s vendas, codigo define %d" % (n, limite))
        for i, line in enumerate(text.splitlines(), 1):
            if re.search(r"\d+\s*vendas", line) and "finalizadas" not in line:
                fail(errors, path, "linha %d cita vendas sem 'finalizadas': %s" % (i, plain(line)[:140]))

    # 2) Consequencia do teto precisa estar explicita nas paginas de oferta.
    consequencia = "bloqueadas at[eé] o m[eê]s seguinte"
    for path in (
        os.path.join(PDV_DOCS, "index.html"),
        os.path.join(PDV_DOCS, "download.html"),
        os.path.join(DEV, r"caracore-loja\docs\download.html"),
    ):
        if not re.search(consequencia, plain(read(path)), re.I):
            fail(errors, path, "nao explica o bloqueio de novas vendas no teto")

    # 3) CBS/IBS sempre como estimativa (ou negado explicitamente).
    for path in glob.glob(os.path.join(PDV_DOCS, "*.html")):
        text = read(path)
        for m in re.finditer(r"CBS/IBS", text):
            before = plain(text[max(0, m.start() - 90):m.start()])
            if "estimado" not in before.lower() and "não calcula" not in before.lower():
                fail(errors, path, "CBS/IBS sem 'estimado': ...%s..." % before[-70:])

    # 3b) Mesma regra nas paginas publicas de wiki e matriz.
    for path in (
        os.path.join(DEV, r"caracore-wiki\docs\pdv\index.html"),
        os.path.join(DEV, r"caracore-wiki\docs\pdv\contador.html"),
        os.path.join(DEV, r"caracore-wiki\docs\pdv\parceiros.html"),
        os.path.join(DEV, r"caracore-site\portfolio.html"),
    ):
        text = read(path)
        if "cálculo de CBS/IBS" in text or "cálculos IBS/CBS" in text:
            fail(errors, path, "CBS/IBS sem 'estimado'")
        for token in ("100 vendas por mês", "100 vendas/mês"):
            if token in text:
                fail(errors, path, "limite do Free sem 'finalizadas' (%s)" % token)

    # 4) R$ 79,90 somente em contexto de Premium ou suporte pago.
    priced = PDV_CURRENT + HUB_PAGES
    for path in dict.fromkeys(priced):
        for i, line in enumerate(read(path).splitlines(), 1):
            if "79,90" not in line:
                continue
            low = line.lower()
            if not any(k in low for k in ("premium", "suporte", "assinatura")):
                fail(errors, path, "linha %d cita 79,90 fora de Premium/suporte" % i)

    # 5) 'sem assinatura' sem 'digital' (ambiguidade com assinatura de plano).
    for path in dict.fromkeys(PDV_CURRENT + HUB_PAGES):
        for m in re.finditer(r"sem assinatura(?! digital)", read(path), re.I):
            fail(errors, path, "'sem assinatura' sem 'digital' perto do byte %d" % m.start())

    # 6) SLA publicado: toda pagina do Hub que cita 79,90 precisa citar 24 horas.
    for path in HUB_PAGES:
        text = plain(read(path))
        if "79,90" in text and "24 horas" not in text:
            fail(errors, path, "cita 79,90 sem SLA de 24 horas")

    # 7) O que acontece sem o suporte pago.
    for path in (os.path.join(HUB_DOCS, "index.html"), os.path.join(HUB_DOCS, "download.html")):
        if "conta própria" not in plain(read(path)):
            fail(errors, path, "nao diz o que fica por conta da loja sem suporte")

    # 8) Nenhum h1/CTA vende 'Free' sem qualificacao.
    qualificadores = ("até", "r$", "pré-release", "avaliação", "100 vendas", "3.2.12")
    for path in dict.fromkeys(PDV_CURRENT + HUB_PAGES[:4]):
        text = read(path)
        for h1 in H1_RE.findall(text):
            label = plain(h1)
            low = label.lower()
            if "free" in low and not any(q in low for q in qualificadores):
                fail(errors, path, "h1 vende Free sem qualificacao: %s" % label)
        for anchor in ANCHOR_RE.findall(text):
            label = plain(anchor)
            low = label.lower()
            if "free" in low and ("baix" in low or "pré-release" in low):
                if not any(q in low for q in qualificadores):
                    fail(errors, path, "CTA vende Free sem qualificacao: %s" % label)

    # 9) Sanidade de encoding nas paginas tocadas.
    for path in dict.fromkeys(PDV_CURRENT + HUB_PAGES):
        text = read(path)
        for token in ("Ã©", "Ã£", "Ã¡", "Ã³", "Ãº", "Ã§", "â€", "\ufffd"):
            if token in text:
                warnings.append("%s: possivel mojibake %r" % (os.path.relpath(path, DEV), token))

    out = []
    out.append("check_claims.py — limite lido de PlanoLicencaService: %d vendas finalizadas/mes civil" % limite)
    out.append("")
    if errors:
        out.append("FALHAS (%d):" % len(errors))
        out.extend("  - " + e for e in errors)
    else:
        out.append("FALHAS: nenhuma")
    if warnings:
        out.append("")
        out.append("AVISOS (%d):" % len(warnings))
        out.extend("  - " + w for w in warnings)

    print("\n".join(out))
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())


