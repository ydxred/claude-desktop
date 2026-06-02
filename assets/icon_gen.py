# Claude Code Desktop — app icon generator
# Designed by the local 'gemini' CLI (gemini 0.44.0), rendered with Pillow.
# Usage: python3 icon_gen.py [output.png]   (default: icon.png)

import sys
import math
from PIL import Image, ImageDraw, ImageFilter

def draw_capsule(draw, pt1, pt2, width, fill):
    draw.line([pt1, pt2], fill=fill, width=width)
    r = width // 2
    bbox1 = [int(pt1[0] - r), int(pt1[1] - r), int(pt1[0] + r), int(pt1[1] + r)]
    bbox2 = [int(pt2[0] - r), int(pt2[1] - r), int(pt2[0] + r), int(pt2[1] + r)]
    draw.ellipse(bbox1, fill=fill)
    draw.ellipse(bbox2, fill=fill)

def draw_motif(draw, chevron_color, asterisk_color, offset_x=0, offset_y=0):
    cx1 = 569 + offset_x
    cy1 = 724 + offset_y
    cx2 = 869 + offset_x
    cy2 = 1024 + offset_y
    cx3 = 569 + offset_x
    cy3 = 1324 + offset_y
    
    draw_capsule(draw, (cx1, cy1), (cx2, cy2), 90, chevron_color)
    draw_capsule(draw, (cx2, cy2), (cx3, cy3), 90, chevron_color)
    
    ast_cx = 1319 + offset_x
    ast_cy = 1024 + offset_y
    ast_radius = 170
    ast_thickness = 70
    
    for angle in [0, 45, 90, 135]:
        rad = math.radians(angle)
        dx = math.cos(rad) * ast_radius
        dy = math.sin(rad) * ast_radius
        pt1 = (int(ast_cx - dx), int(ast_cy - dy))
        pt2 = (int(ast_cx + dx), int(ast_cy + dy))
        draw_capsule(draw, pt1, pt2, ast_thickness, asterisk_color)

def main():
    output_path = sys.argv[1] if len(sys.argv) > 1 else "icon.png"
    
    size = 2048
    margin = 128
    radius = 420
    
    box = [margin, margin, size - margin, size - margin]
    
    bg_mask = Image.new("L", (size, size), 0)
    bg_mask_draw = ImageDraw.Draw(bg_mask)
    bg_mask_draw.rounded_rectangle(box, radius=radius, fill=255)
    
    grad_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    grad_draw = ImageDraw.Draw(grad_img)
    
    color_top = (30, 30, 46)
    color_bot = (17, 17, 27)
    
    for y in range(margin, size - margin):
        ratio = (y - margin) / (size - 2 * margin)
        r = int(color_top[0] * (1 - ratio) + color_bot[0] * ratio)
        g = int(color_top[1] * (1 - ratio) + color_bot[1] * ratio)
        b = int(color_top[2] * (1 - ratio) + color_bot[2] * ratio)
        grad_draw.line([(margin, y), (size - margin, y)], fill=(r, g, b, 255), width=1)
    
    base_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    base_img.paste(grad_img, (0, 0), bg_mask)
    
    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_offset_y = 24
    shadow_box = [margin, margin + shadow_offset_y, size - margin, size - margin + shadow_offset_y]
    shadow_draw.rounded_rectangle(shadow_box, radius=radius, fill=(0, 0, 0, 160))
    shadow = shadow.filter(ImageFilter.GaussianBlur(50))
    
    highlight = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    hl_draw = ImageDraw.Draw(highlight)
    hl_box = [margin + 4, margin + 4, size - margin - 4, size - margin - 4]
    hl_draw.rounded_rectangle(hl_box, radius=radius - 4, outline=(255, 255, 255, 30), width=8)
    
    motif_shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ms_draw = ImageDraw.Draw(motif_shadow)
    draw_motif(ms_draw, (0, 0, 0, 120), (0, 0, 0, 120), offset_x=0, offset_y=12)
    motif_shadow = motif_shadow.filter(ImageFilter.GaussianBlur(15))
    
    motif = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    motif_draw = ImageDraw.Draw(motif)
    color_chevron = (203, 166, 247, 255)
    color_asterisk = (217, 119, 87, 255)
    draw_motif(motif_draw, color_chevron, color_asterisk)
    
    final = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    final = Image.alpha_composite(final, shadow)
    final = Image.alpha_composite(final, base_img)
    final = Image.alpha_composite(final, highlight)
    final = Image.alpha_composite(final, motif_shadow)
    final = Image.alpha_composite(final, motif)
    
    final_resized = final.resize((512, 512), Image.Resampling.LANCZOS)
    final_resized.save(output_path, "PNG")

if __name__ == "__main__":
    main()
