"""Extract the word deck from greek_cards.pdf into src/data/words.json.

Usage: python3 -m pip install pypdf && python3 scripts/extract_cards.py path/to/greek_cards.pdf
"""
import json
import re
import sys
from pathlib import Path

from pypdf import PdfReader

OUT = Path(__file__).resolve().parent.parent / "src" / "data" / "words.json"

PLAN_LINE = re.compile(r"^(?P<el>.+?) \[(?P<tr>[^\]]+)\] — (?P<ru>.+)$")
FRONT_HEAD = re.compile(r"^День (\d+) · (.+)$")
BACK_HEAD = re.compile(r"^День (\d+)$")
EXAMPLE = re.compile(r"^\s*([12])\.\s*(.*)$")


def clean(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def parse_plan(text: str):
    """Day plan: day number, topic lines, then 'greek [translit] — ru' lines."""
    start = text.index("План по дням")
    lines = [l for l in text[start:].splitlines()]
    words, day, topic, pending = [], None, [], ""
    for raw in lines:
        line = raw.strip()
        if not line or line in ("План по дням", "День", "Тема", "Слова и перевод"):
            continue
        if re.fullmatch(r"\d+ / \d+", line):
            continue
        if re.fullmatch(r"\d{1,3}", line):
            day, topic, pending = int(line), [], ""
            continue
        if day is None:
            continue
        candidate = (pending + " " + line).strip() if pending else line
        m = PLAN_LINE.match(candidate)
        if m and "[" in candidate:
            words.append({"day": day, "topic": clean(" ".join(topic)), **{k: clean(v) for k, v in m.groupdict().items()}})
            pending = ""
        elif "[" in candidate or pending:
            pending = candidate  # wrapped plan line
        elif words and words[-1]["day"] == day:
            words[-1]["ru"] = clean(words[-1]["ru"] + " " + line)  # wrapped translation
        else:
            topic.append(line)
    return words


def split_cards(text: str, head: re.Pattern):
    cards, cur = [], None
    for line in text.splitlines():
        m = head.match(line.strip())
        if m:
            cur = {"day": int(m.group(1)), "lines": []}
            cards.append(cur)
        elif cur is not None:
            cur["lines"].append(line)
    return cards


def body_and_examples(lines):
    body, ex, cur = [], {}, None
    for line in lines:
        m = EXAMPLE.match(line)
        if m:
            cur = m.group(1)
            ex[cur] = m.group(2)
        elif cur:
            ex[cur] += " " + line
        else:
            body.append(line)
    return [clean(b) for b in body if b.strip()], [clean(ex[k]) for k in sorted(ex)]


def main(pdf: str):
    reader = PdfReader(pdf)
    pages = [p.extract_text() or "" for p in reader.pages]
    first_card = next(i for i, p in enumerate(pages) if FRONT_HEAD.match(p.split("\n", 1)[0].strip()))
    plan = parse_plan("\n".join(pages[:first_card]))

    fronts, backs = [], []
    for page in pages:
        if FRONT_HEAD.search(page.split("\n", 1)[0].strip()):
            fronts += split_cards(page, FRONT_HEAD)
        elif BACK_HEAD.match(page.split("\n", 1)[0].strip()):
            backs += split_cards(page, BACK_HEAD)

    assert len(fronts) == len(backs) == len(plan), (len(fronts), len(backs), len(plan))

    out = []
    for i, (p, f, b) in enumerate(zip(plan, fronts, backs)):
        assert p["day"] == f["day"] == b["day"], (i, p, f["day"], b["day"])
        _, ex_el = body_and_examples(f["lines"])
        back_body, ex_ru = body_and_examples(b["lines"])
        past = next((l for l in back_body if l.startswith("прош.")), None)
        ru, past_txt = p["ru"], None
        m = re.search(r"\s*\(прош\. (.+)\)$", ru)
        if m:
            ru, past_txt = ru[: m.start()], m.group(1)
        elif past:
            past_txt = past.removeprefix("прош.").strip()
        out.append({
            "id": i + 1,
            "day": p["day"],
            "topic": p["topic"],
            "el": p["el"],
            "tr": p["tr"],
            "ru": ru,
            **({"past": past_txt} if past_txt else {}),
            "ex": [{"el": e, "ru": r} for e, r in zip(ex_el, ex_ru)],
        })

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=0))
    print(f"{len(out)} words, {out[-1]['day']} days -> {OUT}")


if __name__ == "__main__":
    main(sys.argv[1])
