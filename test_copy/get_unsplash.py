import urllib.request
import urllib.parse
import re

queries = {
    "blue_ocean": "unsplash blue curacao syrup",
    "green_apple": "unsplash green apple syrup",
    "watermelon": "unsplash watermelon syrup",
    "tandoori_masala": "unsplash tandoori sauce",
    "indian_masala": "unsplash indian spices",
    "mayo": "unsplash mayonnaise"
}

for name, q in queries.items():
    url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(q)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36'})
    try:
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            # Look for URLs starting with unsplash.com/photos/ or images.unsplash.com/photo-
            photo_ids = re.findall(r'unsplash\.com/photos/([a-zA-Z0-9_-]+)', html)
            image_ids = re.findall(r'photo-([a-zA-Z0-9_-]+)\??', html)
            print(f"--- {name} ---")
            print("Photo URLs:", list(set(photo_ids))[:5])
            print("Image IDs:", list(set(image_ids))[:5])
    except Exception as e:
        print(f"Error {name}:", e)
