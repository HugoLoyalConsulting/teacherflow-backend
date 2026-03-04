"""Debug script to list all registered routes"""
import sys
sys.path.insert(0, '.')

from app.main import app

print("\n" + "="*60)
print("REGISTERED ROUTES")
print("="*60)

routes = []
for route in app.routes:
    if hasattr(route, 'methods'):
        methods = ', '.join(route.methods)
        path = route.path
        routes.append((methods, path))

routes_sorted = sorted(routes, key=lambda x: x[1])

for methods, path in routes_sorted:
    print(f"{methods:20} {path}")

print("="*60)
print(f"Total routes: {len(routes)}")
print("="*60 + "\n")
