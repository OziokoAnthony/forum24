from __future__ import annotations

import re


def test_pdf_structure_is_valid():
    from app.pdf import build_sample_pdf

    data = build_sample_pdf("Complete Guide to Web Development", publisher="FORUM24 Learning")

    assert data.startswith(b"%PDF-1.4")
    assert data.endswith(b"%%EOF\n")

    startxref = int(re.search(rb"startxref\n(\d+)", data).group(1))
    assert data[startxref : startxref + 4] == b"xref"

    # Every object listed in the xref must point at "<n> 0 obj".
    xref_block = data[startxref:].split(b"trailer")[0]
    offsets = [int(match) for match in re.findall(rb"(\d{10}) 00000 n", xref_block)]
    assert len(offsets) == 6
    for number, offset in enumerate(offsets, start=1):
        assert data[offset:].startswith(f"{number} 0 obj".encode())

    # The declared stream length must match the bytes between stream/endstream.
    declared = int(re.search(rb"/Length (\d+)", data).group(1))
    stream = data.split(b"stream\n", 1)[1].split(b"\nendstream", 1)[0]
    assert len(stream) == declared


def test_pdf_escapes_parentheses_and_non_latin_text():
    from app.pdf import build_sample_pdf

    data = build_sample_pdf("A (tricky) title — with an em dash")
    assert b"\\(" in data and b"\\)" in data
    assert data.startswith(b"%PDF")
