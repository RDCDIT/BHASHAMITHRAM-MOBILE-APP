from PIL import Image, ImageDraw, ImageFont

ARTIFACT_DIR = '/home/c-dit/.gemini/antigravity/brain/b37a10f6-50b4-4228-8e93-ee7f96a440bd'
mock_w, mock_h = 1060, 1000
duo_screen = Image.new('RGB', (mock_w, mock_h), '#EAE6DF')
dp = ImageDraw.Draw(duo_screen)

font_phone_label = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 17)

def draw_single_phone(start_x_offset, style_key, label_title):
    mw, mh = 480, 920
    px0, py0 = start_x_offset, 55
    px1, py1 = px0 + mw, py0 + mh
    
    dp.rounded_rectangle([px0, py0, px1, py1], radius=32, fill='#F9F6F1', outline='#2B2C51', width=3)
    
    # Header label above phone
    dp.text((px0 + 10, 20), label_title, fill='#2B2C51', font=font_phone_label)
    
    # Top navbar
    top_h = 130
    dp.rounded_rectangle([px0, py0, px1, py0 + top_h], radius=30, fill='#2B2C51')
    dp.rectangle([px0, py0 + 30, px1, py0 + top_h], fill='#2B2C51')
    
    # Hamburger
    dp.line([(px0 + 24, py0 + 50), (px0 + 48, py0 + 50)], fill='#FFFFFF', width=3)
    dp.line([(px0 + 24, py0 + 58), (px0 + 48, py0 + 58)], fill='#FFFFFF', width=3)
    dp.line([(px0 + 24, py0 + 66), (px0 + 48, py0 + 66)], fill='#FFFFFF', width=3)
    
    # Header Title
    font_ht = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansMalayalam-ExtraBold.ttf', 24)
    font_ht_en = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
    font_cdit = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 12)
    
    dp.text((px0 + 140, py0 + 44), 'ഭാഷാമിത്രം', fill='#43AC98', font=font_ht)
    dp.text((px0 + 285, py0 + 46), 'II', fill='#43AC98', font=font_ht_en)
    
    cdit_txt = 'Centre for Development of Imaging Technology (C-DIT)'
    cb = dp.textbbox((0, 0), cdit_txt, font=font_cdit)
    dp.text((px0 + (mw - (cb[2]-cb[0])) // 2, py0 + 88), cdit_txt, fill='#FFFFFF', font=font_cdit)
    
    # Settings icon
    dp.ellipse([px1 - 48, py0 + 48, px1 - 24, py0 + 72], outline='#FFFFFF', width=2)
    
    card_items = [
        ('ഇംഗ്ലീഷ് - മലയാളം', 'പദസേതു', 'em'),
        ('മലയാളം - ഇംഗ്ലീഷ്', 'ഭാഷാസേതു', 'me'),
        ('മലയാള നാനാർത്ഥം', 'വാക്കറിവ്', 'mt'),
        ('മലയാളം - മലയാളം', 'പദമിത്രം', 'mm'),
        ('സമീപകാല തിരയലുകൾ', '', 'recent'),
    ]
    
    font_c_title = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansMalayalam-Bold.ttf', 18)
    font_c_sub = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansMalayalam-Bold.ttf', 14)
    font_chev = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
    
    cy = py0 + top_h + 18
    card_h = 100
    card_margin = 18
    
    for ml_title, ml_sub, fn in card_items:
        card_x0 = px0 + card_margin
        card_x1 = px1 - card_margin
        card_y0 = cy
        card_y1 = cy + card_h
        
        # Card background
        dp.rounded_rectangle([card_x0, card_y0, card_x1, card_y1], radius=20, fill='#FEFEFE', outline='#DFDCD9', width=2)
        
        # Badge Container (56x56)
        bx = card_x0 + 16
        by = card_y0 + (card_h - 56) // 2
        dp.rounded_rectangle([bx, by, bx + 56, by + 56], radius=16, fill='#F7F7F9', outline='#E6E4E2', width=1)
        
        p = f'scratch/bold_styles/{style_key}/{fn}.png'
        b_img = Image.open(p).convert('RGBA')
        b_res = b_img.resize((50, 50), Image.Resampling.LANCZOS)
        duo_screen.paste(b_res, (bx + 3, by + 3), b_res)
            
        tx = bx + 74
        if ml_sub:
            dp.text((tx, card_y0 + 24), ml_title, fill='#252425', font=font_c_title)
            dp.text((tx, card_y0 + 54), ml_sub, fill='#4B5563', font=font_c_sub)
        else:
            dp.text((tx, card_y0 + 38), ml_title, fill='#252425', font=font_c_title)
            
        chx = card_x1 - 46
        chy = card_y0 + (card_h - 36) // 2
        dp.rounded_rectangle([chx, chy, chx + 36, chy + 36], radius=18, fill='#E6F5F2')
        dp.text((chx + 12, chy + 6), '>', fill='#009778', font=font_chev)
        
        cy += card_h + 15

draw_single_phone(30, 'set_a', 'STYLE A: Modern Squircle Linguistic Badges')
draw_single_phone(550, 'set_b', 'STYLE B: Solid App-Tile Badges')

out_duo = f'{ARTIFACT_DIR}/homescreen_styles_a_and_b_comparison.png'
duo_screen.save(out_duo)
print('Saved updated duo screen comparison to', out_duo)
