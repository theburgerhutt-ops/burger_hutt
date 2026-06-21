import urllib.request
import urllib.parse
import re

q = "images.unsplash.com mayonnaise"
url = f"https://www.google.com/search?q={urllib.parse.quote(q)}"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36'})
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        with open("d:\\Burgur hut site\\test_copy\\test_google.html", "w", encoding="utf-8") as f:
            f.write(html)
        print("HTML written to test_google.html")
except Exception as e:
    print("Error:", e)
