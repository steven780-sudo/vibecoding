#!/usr/bin/env python3
"""Generate simple placeholder icons for Tauri"""

from PIL import Image, ImageDraw, ImageFont

def create_icon(size, output_path):
    """Create a simple icon with the letter C"""
    # Create image with blue background
    img = Image.new('RGBA', (size, size), (74, 144, 226, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw white circle
    margin = size // 8
    draw.ellipse([margin, margin, size-margin, size-margin], fill=(255, 255, 255, 255))
    
    # Draw blue C
    try:
        # Try to use a system font
        font_size = size // 2
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        # Fallback to default font
        font = ImageFont.load_default()
    
    text = "C"
    # Get text bounding box
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Center the text
    x = (size - text_width) // 2
    y = (size - text_height) // 2 - bbox[1]
    
    draw.text((x, y), text, fill=(74, 144, 226, 255), font=font)
    
    # Save
    img.save(output_path, 'PNG')
    print(f"Created {output_path}")

# Create icons
create_icon(32, 'frontend/src-tauri/icons/32x32.png')
create_icon(128, 'frontend/src-tauri/icons/128x128.png')
create_icon(256, 'frontend/src-tauri/icons/128x128@2x.png')
create_icon(512, 'frontend/src-tauri/icons/icon.png')

print("Icons generated successfully!")
