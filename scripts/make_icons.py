"""Renders the NoTrash mark (a lime disc with a bar cut out of it) as PNGs, with no third-party libraries."""
import struct, sys, zlib

BG = (9, 9, 11)
LIME = (198, 244, 93)
WHITE = (255, 255, 255)


def coverage(distance):
    """Anti-aliased coverage from a signed distance in pixels (negative = inside)."""
    return max(0.0, min(1.0, 0.5 - distance))


def mark_alpha(x, y, size, scale):
    """Opacity of the mark at a pixel: disc of radius 0.30*size*scale minus a rounded horizontal bar."""
    c = size / 2
    r = 0.30 * size * scale
    dx, dy = x + 0.5 - c, y + 0.5 - c
    disc = coverage((dx * dx + dy * dy) ** 0.5 - r)
    if disc == 0.0:
        return 0.0
    half_w, half_h = r * 0.62, r * 0.16
    qx, qy = abs(dx) - (half_w - half_h), abs(dy)
    bar_d = ((max(qx, 0.0) ** 2 + qy ** 2) ** 0.5 if qx > 0 else qy) - half_h
    return disc * (1.0 - coverage(bar_d))


def write_png(path, size, pixel):
    has_alpha = len(pixel(0, 0)) == 4
    rows = bytearray()
    for y in range(size):
        rows.append(0)
        for x in range(size):
            rows.extend(pixel(x, y))
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF)
    header = struct.pack('>IIBBBBB', size, size, 8, 6 if has_alpha else 2, 0, 0, 0)
    with open(path, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', header) + chunk(b'IDAT', zlib.compress(bytes(rows), 9)) + chunk(b'IEND', b''))


def opaque(size, scale, bg, fg):
    def pixel(x, y):
        a = mark_alpha(x, y, size, scale)
        return tuple(round(bg[i] + (fg[i] - bg[i]) * a) for i in range(3))
    return pixel


def transparent(size, scale, fg):
    def pixel(x, y):
        return (*fg, round(255 * mark_alpha(x, y, size, scale)))
    return pixel


out = sys.argv[1]
write_png(f'{out}/icon.png', 1024, opaque(1024, 1.0, BG, LIME))                         # iOS icon: opaque, no alpha
write_png(f'{out}/splash-icon.png', 1024, transparent(1024, 0.55, LIME))                # splash mark on the splash background
write_png(f'{out}/android-icon-foreground.png', 512, transparent(512, 0.62, LIME))      # inside the adaptive-icon safe zone
write_png(f'{out}/android-icon-background.png', 512, lambda x, y: BG)
write_png(f'{out}/android-icon-monochrome.png', 432, transparent(432, 0.62, WHITE))
