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
    dict(username='arjun',   first_name='Arjun',  last_name='Patel',  email='arjun@gmail.com',   role='seller', password='demo1234'),
    dict(username='kiran',   first_name='Kiran',  last_name='Mehta',  email='kiran@gmail.com',   role='seller', password='demo1234'),
    dict(username='alex',    first_name='Alex',   last_name='Morgan', email='alex@gmail.com',    role='buyer',  password='demo1234'),
    dict(username='james',   first_name='James',  last_name='Taylor', email='james@gmail.com',   role='buyer',  password='demo1234'),
    dict(username='david',   first_name='David',  last_name='Smith',  email='david@gmail.com',   role='buyer',  password='demo1234'),
    dict(username='emily',   first_name='Emily',  last_name='Clark',  email='emily@gmail.com',   role='buyer',  password='demo1234'),
    dict(username='michael', first_name='Michael',last_name='Brown',  email='michael@gmail.com', role='buyer',  password='demo1234'),
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
arjun  = created['arjun']
kiran  = created['kiran']
alex   = created['alex']
james  = created['james']

# Gigs
GIGS = [
    dict(seller=ranvir, title='I will build a full-stack web app with React and Django', description='Complete web app with JWT auth, REST API, PostgreSQL database, admin panel, and responsive React frontend. Source code included.', category='Development', price_basic=2499, price_standard=4999, price_premium=8999, delivery_basic=7, delivery_standard=14, delivery_premium=21, rating=4.9, review_count=48, orders_completed=48),
    dict(seller=ranvir, title='I will build a REST API with Django and PostgreSQL', description='Robust REST API with Django REST Framework. Includes JWT auth, filtering, pagination, and Swagger documentation.', category='Development', price_basic=1999, price_standard=3999, price_premium=6999, delivery_basic=5, delivery_standard=10, delivery_premium=18, rating=5.0, review_count=32, orders_completed=32),
    dict(seller=ranvir, title='I will create a responsive landing page using React', description='Fast, responsive, and SEO-friendly landing page with modern design patterns and smooth animations.', category='Development', price_basic=999, price_standard=1999, price_premium=2999, delivery_basic=3, delivery_standard=5, delivery_premium=7, rating=4.8, review_count=15, orders_completed=15),
    
    dict(seller=priya,  title='I will design a modern logo for your brand', description='Professional logo with 3 unique concepts, vector files (AI, SVG, PNG), brand kit, and commercial rights. Fast delivery guaranteed.', category='Design', price_basic=999, price_standard=1999, price_premium=3999, delivery_basic=3, delivery_standard=5, delivery_premium=10, rating=4.8, review_count=128, orders_completed=128),
    dict(seller=priya,  title='I will design a stunning UI/UX for your app', description='Complete UI/UX design in Figma — wireframes, high-fidelity mockups, prototype, and design system. Dark mode included.', category='Design', price_basic=1499, price_standard=2999, price_premium=5499, delivery_basic=4, delivery_standard=8, delivery_premium=15, rating=4.8, review_count=76, orders_completed=76),
    dict(seller=priya,  title='I will create social media graphics for your campaign', description='Custom, highly engaging posts for Instagram, Facebook, and Twitter. Includes source files and unlimited revisions.', category='Design', price_basic=499, price_standard=999, price_premium=1999, delivery_basic=2, delivery_standard=4, delivery_premium=7, rating=4.9, review_count=45, orders_completed=45),

    dict(seller=sara,   title='I will write SEO-optimized blog posts for your website', description='Professional content writing with keyword research, meta descriptions, and plagiarism-free articles that rank on Google.', category='Writing', price_basic=499, price_standard=999, price_premium=1999, delivery_basic=2, delivery_standard=4, delivery_premium=7, rating=4.9, review_count=203, orders_completed=203),
    dict(seller=sara,   title='I will craft compelling ad copy for Facebook and Google', description='High-converting ad copy that drives clicks and sales. Perfect for e-commerce, software, or local businesses.', category='Writing', price_basic=299, price_standard=599, price_premium=999, delivery_basic=1, delivery_standard=3, delivery_premium=5, rating=4.7, review_count=60, orders_completed=60),
    dict(seller=sara,   title='I will write a professional press release for your startup', description='Get your business noticed with a professionally written press release distributed to major news outlets.', category='Writing', price_basic=799, price_standard=1499, price_premium=2499, delivery_basic=3, delivery_standard=5, delivery_premium=7, rating=5.0, review_count=18, orders_completed=18),

    dict(seller=arjun,  title='I will edit your YouTube videos professionally', description='Engaging video editing with jump cuts, background music, sound effects, B-roll, and color grading.', category='Video', price_basic=899, price_standard=1799, price_premium=3599, delivery_basic=3, delivery_standard=6, delivery_premium=10, rating=4.8, review_count=88, orders_completed=88),
    dict(seller=arjun,  title='I will create a promotional video for your product', description='High-quality promo video with dynamic text, stock footage, voiceover, and royalty-free music.', category='Video', price_basic=1999, price_standard=3999, price_premium=7999, delivery_basic=5, delivery_standard=10, delivery_premium=15, rating=4.9, review_count=42, orders_completed=42),
    dict(seller=arjun,  title='I will add subtitles and captions to your videos', description='Perfectly synced, styled captions for TikTok, Instagram Reels, or YouTube Shorts. Boost your engagement instantly.', category='Video', price_basic=299, price_standard=599, price_premium=1199, delivery_basic=1, delivery_standard=2, delivery_premium=4, rating=5.0, review_count=150, orders_completed=150),

    dict(seller=kiran,  title='I will manage your Instagram and Facebook accounts', description='Complete social media management: content creation, posting schedule, community engagement, and monthly reporting.', category='Marketing', price_basic=1499, price_standard=2999, price_premium=5999, delivery_basic=7, delivery_standard=14, delivery_premium=30, rating=4.7, review_count=55, orders_completed=55),
    dict(seller=kiran,  title='I will run profitable Google Ads campaigns', description='Setup and optimization of Google Search Ads. Keyword research, ad creation, and conversion tracking included.', category='Marketing', price_basic=1999, price_standard=3999, price_premium=7999, delivery_basic=5, delivery_standard=10, delivery_premium=20, rating=4.8, review_count=90, orders_completed=90),
    dict(seller=kiran,  title='I will do comprehensive SEO keyword research', description='Find low-competition, high-volume keywords for your niche. Includes competitor analysis and content strategy map.', category='Marketing', price_basic=499, price_standard=999, price_premium=1999, delivery_basic=2, delivery_standard=4, delivery_premium=7, rating=4.9, review_count=112, orders_completed=112),
    dict(seller=kiran,  title='I will set up email marketing automation', description='Welcome series, abandoned cart recovery, and promotional campaigns set up in Mailchimp or Klaviyo.', category='Marketing', price_basic=999, price_standard=1999, price_premium=3999, delivery_basic=3, delivery_standard=7, delivery_premium=14, rating=4.9, review_count=35, orders_completed=35),
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
    dict(buyer=james, seller=priya,  gig=gig_objects[3], package='basic',    amount=999,  status='delivered',   requirements='Logo for my restaurant. Warm colors please.'),
    dict(buyer=alex,  seller=sara,   gig=gig_objects[6], package='standard', amount=999,  status='completed',   requirements='5 blog posts about digital marketing.'),
    dict(buyer=james, seller=arjun,  gig=gig_objects[10],package='basic',    amount=3999, status='pending',     requirements='Please make a promo video for my app.'),
    dict(buyer=alex,  seller=kiran,  gig=gig_objects[12],package='standard', amount=2999, status='in_progress', requirements='Manage my Instagram page for the next two weeks.'),
]

for o in ORDERS:
    if not Order.objects.filter(buyer=o['buyer'], gig=o['gig']).exists():
        Order.objects.create(**o)
        print(f"  ✅ Order: {o['buyer'].first_name} → {o['seller'].first_name} [{o['status']}]")
    else:
        print(f"  ⚠️  Skipped order (exists)")

print("\n" + "="*50)
print("✅ Done! Login credentials:")
print("   Sellers: ranvir, priya, sara, arjun, kiran (password: demo1234)")
print("   Buyers: alex, james, david, emily, michael (password: demo1234)")
print("   Admin: admin (password: admin1234)")
print("="*50)
