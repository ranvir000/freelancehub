"""
Run once to fill the database with demo data.
Command: python seed.py
"""
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'freelancehub.settings')
django.setup()

from api.models import User, Gig, Order

print("🌱 Seeding FreelanceHub database...")

# Users
USERS = [
    dict(username='ranvir',  first_name='Ranvir', last_name='Singh',  email='ranvir@gmail.com',  role='seller', password='demo1234'),
    dict(username='priya',   first_name='Priya',  last_name='Kapoor', email='priya@gmail.com',   role='seller', password='demo1234'),
    dict(username='sara',    first_name='Sara',   last_name='Liu',    email='sara@gmail.com',    role='seller', password='demo1234'),
    dict(username='alex',    first_name='Alex',   last_name='Morgan', email='alex@gmail.com',    role='buyer',  password='demo1234'),
    dict(username='james',   first_name='James',  last_name='Taylor', email='james@gmail.com',   role='buyer',  password='demo1234'),
    dict(username='admin',   first_name='Admin',  last_name='User',   email='admin@gmail.com',   role='admin',  password='admin1234'),
]

created = {}
for u in USERS:
    if not User.objects.filter(username=u['username']).exists():
        pw = u.pop('password')
        user = User.objects.create_user(password=pw, **u)
        created[u['username']] = user
        print(f"  ✅ User: {user.name} ({user.role})")
    else:
        created[u['username']] = User.objects.get(username=u['username'])
        print(f"  ⚠️  Skipped (exists): {u['username']}")

ranvir = created['ranvir']
priya  = created['priya']
sara   = created['sara']
alex   = created['alex']
james  = created['james']

# Gigs
GIGS = [
    dict(seller=ranvir, title='I will build a full-stack web app with React and Django', description='Complete web app with JWT auth, REST API, PostgreSQL database, admin panel, and responsive React frontend. Source code included.', category='Development', price_basic=2499, price_standard=4999, price_premium=8999, delivery_basic=7, delivery_standard=14, delivery_premium=21, rating=4.9, review_count=48, orders_completed=48),
    dict(seller=priya,  title='I will design a modern logo for your brand', description='Professional logo with 3 unique concepts, vector files (AI, SVG, PNG), brand kit, and commercial rights. Fast delivery guaranteed.', category='Design', price_basic=999, price_standard=1999, price_premium=3999, delivery_basic=3, delivery_standard=5, delivery_premium=10, rating=4.8, review_count=128, orders_completed=128),
    dict(seller=ranvir, title='I will build a REST API with Django and PostgreSQL', description='Robust REST API with Django REST Framework. Includes JWT auth, filtering, pagination, and Swagger documentation.', category='Development', price_basic=1999, price_standard=3999, price_premium=6999, delivery_basic=5, delivery_standard=10, delivery_premium=18, rating=5.0, review_count=32, orders_completed=32),
    dict(seller=sara,   title='I will write SEO-optimized blog posts for your website', description='Professional content writing with keyword research, meta descriptions, and plagiarism-free articles that rank on Google.', category='Writing', price_basic=499, price_standard=999, price_premium=1999, delivery_basic=2, delivery_standard=4, delivery_premium=7, rating=4.9, review_count=203, orders_completed=203),
    dict(seller=priya,  title='I will design a stunning UI/UX for your app', description='Complete UI/UX design in Figma — wireframes, high-fidelity mockups, prototype, and design system. Dark mode included.', category='Design', price_basic=1499, price_standard=2999, price_premium=5499, delivery_basic=4, delivery_standard=8, delivery_premium=15, rating=4.8, review_count=76, orders_completed=76),
]

gig_objects = []
for g in GIGS:
    if not Gig.objects.filter(title=g['title']).exists():
        gig = Gig.objects.create(**g)
        gig_objects.append(gig)
        print(f"  ✅ Gig: {gig.title[:50]}...")
    else:
        gig_objects.append(Gig.objects.get(title=g['title']))
        print(f"  ⚠️  Skipped gig (exists)")

# Orders
ORDERS = [
    dict(buyer=alex,  seller=ranvir, gig=gig_objects[0], package='standard', amount=4999, status='in_progress', requirements='I need a freelancing platform for my startup.'),
    dict(buyer=james, seller=priya,  gig=gig_objects[1], package='basic',    amount=999,  status='delivered',   requirements='Logo for my restaurant. Warm colors please.'),
    dict(buyer=alex,  seller=sara,   gig=gig_objects[3], package='standard', amount=999,  status='completed',   requirements='5 blog posts about digital marketing.'),
    dict(buyer=james, seller=ranvir, gig=gig_objects[2], package='basic',    amount=1999, status='pending',     requirements='Need an API for my mobile app.'),
]

for o in ORDERS:
    if not Order.objects.filter(buyer=o['buyer'], gig=o['gig']).exists():
        Order.objects.create(**o)
        print(f"  ✅ Order: {o['buyer'].first_name} → {o['seller'].first_name} [{o['status']}]")
    else:
        print(f"  ⚠️  Skipped order (exists)")

print("\n" + "="*50)
print("✅ Done! Login credentials:")
print("   ranvir / demo1234  → Seller")
print("   priya  / demo1234  → Seller")
print("   sara   / demo1234  → Seller")
print("   alex   / demo1234  → Buyer")
print("   james  / demo1234  → Buyer")
print("   admin  / admin1234 → Admin")
print("="*50)
