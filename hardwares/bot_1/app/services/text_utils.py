import re

# Nepali sentences end in the danda (।) or double danda (॥); also cover the
# common Latin terminators in case the reply mixes in English/numbers.
_SENTENCE_BOUNDARY_RE = re.compile(r"([।॥!?.]+)")


def split_sentences(buffer: str):
    """Split `buffer` into complete, punctuation-terminated sentences plus a remainder.

    Returns (sentences, remainder) where `sentences` is a list of strings each ending
    in their terminating punctuation, and `remainder` is the trailing text that hasn't
    hit a sentence boundary yet (feed it back in on the next call along with new tokens).
    """
    parts = _SENTENCE_BOUNDARY_RE.split(buffer)

    sentences = []
    i = 0
    while i < len(parts) - 1:
        text = parts[i].strip()
        punctuation = parts[i + 1]
        if text:
            sentences.append(text + punctuation)
        i += 2

    remainder = parts[-1] if len(parts) % 2 == 1 else ""
    return sentences, remainder
