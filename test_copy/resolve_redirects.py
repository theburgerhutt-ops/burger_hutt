import urllib.request

url = "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFpvih5hPH43a9iMt1MK_70Nc8gmFRzqNDK3YrC81nbbjK9iKMPtEq2VAn5vkriP_bV-gW4G6YsHt4oSp4YI9zAtvzNyRYb7pANDAm_zCBnGx_brWEICH22Xp5R69I="
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    with urllib.request.urlopen(req) as r:
        print("Redirected to:", r.geturl())
except Exception as e:
    print("Error:", e)
