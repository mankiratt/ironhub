"""One-off image compression pass for /images. Run with: python scripts/compress-images.py
Resizes oversized originals down to sane web dimensions and re-encodes:
  - JPEGs: max 2000px long edge, quality 82, progressive
  - PNGs with alpha (transparent cut-outs): kept as PNG, resized + optimized
  - PNGs without alpha (flat photos): converted to JPEG (much smaller, no quality loss for photos)
Originals are overwritten in place (this repo isn't under git, so no undo — sizes were huge/unused elsewhere).
"""
import os
from PIL import Image

IMG_DIR = os.path.join(os.path.dirname(__file__), "..", "images")
MAX_EDGE = 2000
JPEG_QUALITY = 82

def has_alpha(im):
    return im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)

def resize_if_needed(im):
    w, h = im.size
    long_edge = max(w, h)
    if long_edge <= MAX_EDGE:
        return im
    scale = MAX_EDGE / long_edge
    return im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)

def process(path):
    name = os.path.basename(path)
    ext = os.path.splitext(name)[1].lower()
    if ext not in (".jpg", ".jpeg", ".png"):
        return
    before = os.path.getsize(path)
    im = Image.open(path)
    im = resize_if_needed(im)

    if ext == ".png" and has_alpha(im):
        out_path = path
        im.save(out_path, "PNG", optimize=True)
    else:
        # flatten any alpha/palette onto black-safe white bg (none of these are transparent) and save as JPEG
        if im.mode != "RGB":
            im = im.convert("RGB")
        out_path = os.path.splitext(path)[0] + ".jpg"
        im.save(out_path, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
        if ext == ".png" and out_path != path:
            os.remove(path)

    after = os.path.getsize(out_path)
    print(f"{name:28s} {before/1024:8.0f} KB -> {os.path.basename(out_path):28s} {after/1024:8.0f} KB  ({100*after/before:.0f}%)")

def main():
    for fname in sorted(os.listdir(IMG_DIR)):
        if fname == "favicon.svg":
            continue
        fpath = os.path.join(IMG_DIR, fname)
        if os.path.isfile(fpath):
            process(fpath)

if __name__ == "__main__":
    main()
