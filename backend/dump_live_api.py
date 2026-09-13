import urllib.request
import json

key = '579b464db66ec23bdd000001154c67779ae44f07596666938a696d0c'
resource = '9ef84268-d588-465a-a308-a864a43d0070'
url = f'https://api.data.gov.in/resource/{resource}?api-key={key}&format=json&limit=200'
req = urllib.request.Request(url, headers={'User-Agent': 'FarmLinkDirect/5.0'})
with urllib.request.urlopen(req) as resp:
    d = json.loads(resp.read().decode('utf-8'))
    recs = d.get('records', [])
    print(f'Retrieved {len(recs)} records.')
    
    up_recs = [r for r in recs if 'uttar pradesh' in (r.get('state') or '').lower()]
    print(f'UP records count: {len(up_recs)}')
    for r in up_recs:
        p = float(r.get('modal_price', 0)) / 100
        print(f"  UP: {r.get('district')} - {r.get('market')} : {r.get('commodity')} = Rs {p:.1f}/kg")

    print('\nAll unique commodities in API right now:')
    comms = set(r.get('commodity') for r in recs)
    for c in sorted(comms):
        matching = [r for r in recs if r.get('commodity') == c]
        avg_price = sum(float(r.get('modal_price', 0)) for r in matching) / len(matching) / 100
        markets = ", ".join([f"{m.get('district')}:{float(m.get('modal_price',0))/100:.1f}" for m in matching[:3]])
        print(f"  {c:20s}: {len(matching)} recs | avg Rs {avg_price:5.1f}/kg | [{markets}]")
