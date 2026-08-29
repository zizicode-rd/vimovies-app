from PIL import Image, ImageDraw, ImageFont
import math

W, H = 1200, 630
SAFE = 630
SAFE_X = (W - SAFE) // 2  # 285

img = Image.new('RGB', (W, H), '#000000')
draw = ImageDraw.Draw(img)

# Safe area guide (optional, uncomment to debug)
# draw.rectangle([SAFE_X, 0, SAFE_X + SAFE, H], outline='#1a1a1a', width=1)

# Diamond isotype
diamond_size = 160
cx, cy = W // 2, 260
points = [
    (cx, cy - diamond_size // 2),
    (cx + diamond_size // 2, cy),
    (cx, cy + diamond_size // 2),
    (cx - diamond_size // 2, cy),
]
draw.polygon(points, fill='#ff2f37')

# Optional inner highlight for a little 3D feel
small = [(cx, cy - 35), (cx + 35, cy), (cx, cy + 35), (cx - 35, cy)]
draw.polygon(small, fill='#ff4a4f')

# Text
font_size = 96
try:
    font = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', font_size)
except:
    font = ImageFont.load_default()

text = 'vimonitors'
bbox = draw.textbbox((0, 0), text, font=font)
text_w = bbox[2] - bbox[0]
text_h = bbox[3] - bbox[1]
text_x = (W - text_w) // 2
text_y = cy + diamond_size // 2 + 40 - bbox[1]  # baseline correction
draw.text((text_x, text_y), text, font=font, fill='#ffffff')

img.save('public/og.png')
img.save('src/app/opengraph-image.png')
img.save('src/app/twitter-image.png')
print('generated 1200x630 OG image')
