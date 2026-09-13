import urllib.request
import urllib.parse
import json

key = '579b464db66ec23bdd000001154c67779ae44f07596666938a696d0c'
resource = '9ef84268-d588-465a-a308-a864a43d0070'

print("--- TEST 1: Checking total records and recent records ---")
url = f"https://api.data.gov.in/resource/{resource}?api-key={key}&format=json&limit=10"
req = urllib.request.Request(url, headers={'User-Agent': 'FarmLinkDirect/5.0'})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        d = json.loads(resp.read().decode('utf-8'))
        print("Status: 200 OK")
        print("Total in DB:", d.get('total'))
        print("Created/Updated:", d.get('updated_date'), d.get('desc'))
        for r in d.get('records', []):
            print(f"[{r.get('arrival_date')}] {r.get('state')} | {r.get('district')} | {r.get('market')} | {r.get('commodity')} | modal: {r.get('modal_price')}")
except Exception as e:
    print("Error:", e)

print("\n--- TEST 2: Querying Uttar Pradesh for our 10 commodities ---")
commodities = ['Tomato', 'Onion', 'Potato', 'Mango', 'Green Chilli', 'Garlic', 'Ginger(Green)', 'Spinach', 'Cauliflower', 'Wheat']
for comm in commodities:
    url = f"https://api.data.gov.in/resource/{resource}?api-key={key}&format=json&filters%5Bstate%5D=Uttar+Pradesh&filters%5Bcommodity%5D={urllib.parse.quote(comm)}&limit=10"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'FarmLinkDirect/5.0'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            d = json.loads(resp.read().decode('utf-8'))
            recs = d.get('records', [])
            print(f"{comm} (UP): found {len(recs)} records (total: {d.get('total')})")
            for r in recs[:2]:
                print(f"   -> {r.get('arrival_date')} | {r.get('district')} - {r.get('market')} | modal: {r.get('modal_price')}")
    except Exception as e:
        print(f"{comm} (UP) Error: {e}")
