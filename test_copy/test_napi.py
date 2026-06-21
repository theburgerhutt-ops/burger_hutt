import urllib.request
import json
import urllib.parse

query = "mayonnaise"
url = f"https://unsplash.com/napi/search/photos?query={urllib.parse.quote(query)}"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36'})
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        print("Success! Keys in response:", data.keys())
        if 'results' in data and len(data['results']) > 0:
            print("First image ID:", data['results'][0]['id'])
            print("First image URL:", data['results'][0]['urls']['regular'])
except Exception as e:
    print("Error:", e)
