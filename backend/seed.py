"""
Run once to fill the database with demo data.
Command: python seed.py
"""
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'freelancehub.settings')
django.setup()

from api.models import User, Gig, Order, Review, Message, Favourite

print("Seeding FreelanceHub database...")

# ── USERS ──────────────────────────────────────────────────────────────────
USERS = [
    dict(username='ranvir',  first_name='Ranvir', last_name='Singh',  email='ranvir@gmail.com',  role='seller', password='demo1234', bio='Full-stack developer specializing in React, Django, and cloud solutions.', skills='React,Django,PostgreSQL,AWS', location='Mumbai, India', hourly_rate=2500),
    dict(username='sneha',   first_name='Sneha',  last_name='Reddy',  email='sneha@gmail.com',   role='seller', password='demo1234', bio='Brand designer and UI/UX specialist with 7 years creating stunning visuals.', skills='Figma,Branding,Logo Design,Illustration', location='Delhi, India', hourly_rate=1800),
    dict(username='sara',    first_name='Sara',   last_name='Liu',    email='sara@gmail.com',    role='seller', password='demo1234', bio='Professional content writer with expertise in SEO and technical writing.', skills='Blog Writing,SEO,Copywriting,Research', location='Bangalore, India', hourly_rate=1200),
    dict(username='arjun',   first_name='Arjun',  last_name='Patel',  email='arjun@gmail.com',   role='seller', password='demo1234', bio='Video producer and editor creating engaging content for YouTube and social media.', skills='Premiere Pro,After Effects,Color Grading,Motion Graphics', location='Hyderabad, India', hourly_rate=2000),
    dict(username='kiran',   first_name='Kiran',  last_name='Mehta',  email='kiran@gmail.com',   role='seller', password='demo1234', bio='Digital marketing expert growing brands through paid ads, SEO, and content.', skills='Google Ads,Facebook Ads,SEO,Analytics', location='Pune, India', hourly_rate=1500),
    dict(username='alex',    first_name='Alex',   last_name='Morgan', email='alex@gmail.com',    role='buyer',  password='demo1234'),
    dict(username='james',   first_name='James',  last_name='Taylor', email='james@gmail.com',   role='buyer',  password='demo1234'),
    dict(username='david',   first_name='David',  last_name='Smith',  email='david@gmail.com',   role='buyer',  password='demo1234'),
    dict(username='emily',   first_name='Emily',  last_name='Clark',  email='emily@gmail.com',   role='buyer',  password='demo1234'),
    dict(username='michael', first_name='Michael',last_name='Brown',  email='michael@gmail.com', role='buyer',  password='demo1234'),
    dict(username='admin',   first_name='Admin',  last_name='User',   email='admin@gmail.com',   role='admin',  password='admin1234'),
]

created = {}
for u in USERS:
    pw = u.pop('password')
    if not User.objects.filter(username=u['username']).exists():
        user = User.objects.create_user(password=pw, **u)
        created[u['username']] = user
        print(f"  OK User: {user.name} ({user.role})")
    else:
        created[u['username']] = User.objects.get(username=u['username'])
        print(f"  -- Skipped (exists): {u['username']}")

ranvir  = created['ranvir']
sneha   = created['sneha']
sara    = created['sara']
arjun   = created['arjun']
kiran   = created['kiran']
alex    = created['alex']
james   = created['james']
david   = created['david']
emily   = created['emily']
michael = created['michael']

# ── GIGS ───────────────────────────────────────────────────────────────────
GIGS = [
    # Ranvir — Development (index 0,1,2)
    dict(seller=ranvir, title='I will build a full-stack web app with React and Django', description='Complete web app with JWT auth, REST API, PostgreSQL database, admin panel, and responsive React frontend. Source code included.', category='Development', price_basic=2499, price_standard=4999, price_premium=8999, delivery_basic=7, delivery_standard=14, delivery_premium=21, rating=4.9, review_count=48, orders_completed=48),
    dict(seller=ranvir, title='I will build a REST API with Django and PostgreSQL', description='Robust REST API with Django REST Framework. Includes JWT auth, filtering, pagination, and Swagger documentation.', category='Development', price_basic=1999, price_standard=3999, price_premium=6999, delivery_basic=5, delivery_standard=10, delivery_premium=18, rating=5.0, review_count=32, orders_completed=32),
    dict(seller=ranvir, title='I will create a responsive landing page using React', description='Fast, responsive, and SEO-friendly landing page with modern design patterns and smooth animations.', category='Development', price_basic=999, price_standard=1999, price_premium=2999, delivery_basic=3, delivery_standard=5, delivery_premium=7, rating=4.8, review_count=15, orders_completed=15),
    # Sneha — Design (index 3,4,5)
    dict(seller=sneha,  title='I will design a modern logo for your brand', description='Professional logo with 3 unique concepts, vector files (AI, SVG, PNG), brand kit, and commercial rights. Fast delivery guaranteed.', category='Design', price_basic=999, price_standard=1999, price_premium=3999, delivery_basic=3, delivery_standard=5, delivery_premium=10, rating=4.8, review_count=128, orders_completed=128),
    dict(seller=sneha,  title='I will design a stunning UI/UX for your app', description='Complete UI/UX design in Figma — wireframes, high-fidelity mockups, prototype, and design system. Dark mode included.', category='Design', price_basic=1499, price_standard=2999, price_premium=5499, delivery_basic=4, delivery_standard=8, delivery_premium=15, rating=4.8, review_count=76, orders_completed=76),
    dict(seller=sneha,  title='I will create social media graphics for your campaign', description='Custom, highly engaging posts for Instagram, Facebook, and Twitter. Includes source files and unlimited revisions.', category='Design', price_basic=499, price_standard=999, price_premium=1999, delivery_basic=2, delivery_standard=4, delivery_premium=7, rating=4.9, review_count=45, orders_completed=45),
    # Sara — Writing (index 6,7,8)
    dict(seller=sara,   title='I will write SEO-optimized blog posts for your website', description='Professional content writing with keyword research, meta descriptions, and plagiarism-free articles that rank on Google.', category='Writing', price_basic=499, price_standard=999, price_premium=1999, delivery_basic=2, delivery_standard=4, delivery_premium=7, rating=4.9, review_count=203, orders_completed=203),
    dict(seller=sara,   title='I will craft compelling ad copy for Facebook and Google', description='High-converting ad copy that drives clicks and sales. Perfect for e-commerce, software, or local businesses.', category='Writing', price_basic=299, price_standard=599, price_premium=999, delivery_basic=1, delivery_standard=3, delivery_premium=5, rating=4.7, review_count=60, orders_completed=60),
    dict(seller=sara,   title='I will write a professional press release for your startup', description='Get your business noticed with a professionally written press release distributed to major news outlets.', category='Writing', price_basic=799, price_standard=1499, price_premium=2499, delivery_basic=3, delivery_standard=5, delivery_premium=7, rating=5.0, review_count=18, orders_completed=18),
    # Arjun — Video (index 9,10,11)
    dict(seller=arjun,  title='I will edit your YouTube videos professionally', description='Engaging video editing with jump cuts, background music, sound effects, B-roll, and color grading.', category='Video', price_basic=899, price_standard=1799, price_premium=3599, delivery_basic=3, delivery_standard=6, delivery_premium=10, rating=4.8, review_count=88, orders_completed=88),
    dict(seller=arjun,  title='I will create a promotional video for your product', description='High-quality promo video with dynamic text, stock footage, voiceover, and royalty-free music.', category='Video', price_basic=1999, price_standard=3999, price_premium=7999, delivery_basic=5, delivery_standard=10, delivery_premium=15, rating=4.9, review_count=42, orders_completed=42),
    dict(seller=arjun,  title='I will add subtitles and captions to your videos', description='Perfectly synced, styled captions for TikTok, Instagram Reels, or YouTube Shorts. Boost your engagement instantly.', category='Video', price_basic=299, price_standard=599, price_premium=1199, delivery_basic=1, delivery_standard=2, delivery_premium=4, rating=5.0, review_count=150, orders_completed=150),
    # Kiran — Marketing (index 12,13,14,15)
    dict(seller=kiran,  title='I will manage your Instagram and Facebook accounts', description='Complete social media management: content creation, posting schedule, community engagement, and monthly reporting.', category='Marketing', price_basic=1499, price_standard=2999, price_premium=5999, delivery_basic=7, delivery_standard=14, delivery_premium=30, rating=4.7, review_count=55, orders_completed=55),
    dict(seller=kiran,  title='I will run profitable Google Ads campaigns', description='Setup and optimization of Google Search Ads. Keyword research, ad creation, and conversion tracking included.', category='Marketing', price_basic=1999, price_standard=3999, price_premium=7999, delivery_basic=5, delivery_standard=10, delivery_premium=20, rating=4.8, review_count=90, orders_completed=90),
    dict(seller=kiran,  title='I will do comprehensive SEO keyword research', description='Find low-competition, high-volume keywords for your niche. Includes competitor analysis and content strategy map.', category='Marketing', price_basic=499, price_standard=999, price_premium=1999, delivery_basic=2, delivery_standard=4, delivery_premium=7, rating=4.9, review_count=112, orders_completed=112),
    dict(seller=kiran,  title='I will set up email marketing automation', description='Welcome series, abandoned cart recovery, and promotional campaigns set up in Mailchimp or Klaviyo.', category='Marketing', price_basic=999, price_standard=1999, price_premium=3999, delivery_basic=3, delivery_standard=7, delivery_premium=14, rating=4.9, review_count=35, orders_completed=35),
]

G = {}  # title -> gig object
for g in GIGS:
    if not Gig.objects.filter(title=g['title']).exists():
        gig = Gig.objects.create(**g)
        G[gig.title] = gig
        print(f"  OK Gig: {gig.title[:55]}")
    else:
        gig = Gig.objects.get(title=g['title'])
        G[gig.title] = gig
        print(f"  -- Skipped gig: {gig.title[:55]}")

# Shortcuts
g_webapp   = G['I will build a full-stack web app with React and Django']
g_api      = G['I will build a REST API with Django and PostgreSQL']
g_landing  = G['I will create a responsive landing page using React']
g_logo     = G['I will design a modern logo for your brand']
g_uiux     = G['I will design a stunning UI/UX for your app']
g_social   = G['I will create social media graphics for your campaign']
g_blog     = G['I will write SEO-optimized blog posts for your website']
g_adcopy   = G['I will craft compelling ad copy for Facebook and Google']
g_press    = G['I will write a professional press release for your startup']
g_youtube  = G['I will edit your YouTube videos professionally']
g_promo    = G['I will create a promotional video for your product']
g_captions = G['I will add subtitles and captions to your videos']
g_smm      = G['I will manage your Instagram and Facebook accounts']
g_gads     = G['I will run profitable Google Ads campaigns']
g_seo      = G['I will do comprehensive SEO keyword research']
g_email    = G['I will set up email marketing automation']

# ── ORDERS ─────────────────────────────────────────────────────────────────
# Strategy for May 19 presentation:
#   completed  — shows reviews, ratings, full lifecycle
#   delivered  — buyer can approve/review in demo
#   in_progress — active work
#   pending    — seller can accept in demo
# Each buyer gets 2-3 orders across different sellers/categories

ORDERS_DATA = [
    # ── ALEX (buyer) ──
    dict(buyer=alex, seller=ranvir, gig=g_webapp,  package='standard', amount=4999, status='completed',   requirements='Build a freelancing marketplace with buyer and seller roles, JWT auth, and Stripe payments.'),
    dict(buyer=alex, seller=sneha,  gig=g_logo,    package='basic',    amount=999,  status='completed',   requirements='Logo for my new tech startup. Modern, minimal, blue palette preferred.'),
    dict(buyer=alex, seller=sara,   gig=g_blog,    package='standard', amount=999,  status='delivered',   requirements='5 SEO blog posts on AI and machine learning trends for 2025.'),
    dict(buyer=alex, seller=kiran,  gig=g_smm,     package='basic',    amount=1499, status='in_progress', requirements='Manage my Instagram and LinkedIn pages for the next month.'),

    # ── JAMES (buyer) ──
    dict(buyer=james, seller=sneha,  gig=g_uiux,   package='standard', amount=2999, status='completed',   requirements='UI/UX redesign for my restaurant booking app. Dark mode is a must.'),
    dict(buyer=james, seller=arjun,  gig=g_promo,  package='basic',    amount=1999, status='delivered',   requirements='Promo video for my new mobile app launch. Upbeat music, 60 seconds.'),
    dict(buyer=james, seller=ranvir, gig=g_api,    package='basic',    amount=1999, status='in_progress', requirements='REST API for my mobile app — user auth, product listing, and order management.'),

    # ── DAVID (buyer) ──
    dict(buyer=david, seller=sara,   gig=g_adcopy,  package='standard', amount=599,  status='completed',   requirements='Ad copy for 3 Facebook campaigns promoting our new fitness app.'),
    dict(buyer=david, seller=kiran,  gig=g_gads,    package='standard', amount=3999, status='in_progress', requirements='Set up Google Ads for our e-commerce store targeting India.'),
    dict(buyer=david, seller=arjun,  gig=g_youtube, package='basic',    amount=899,  status='pending',     requirements='Edit my 20-minute YouTube tutorial on Python Django. Add intro/outro.'),

    # ── EMILY (buyer) ──
    dict(buyer=emily, seller=sneha,  gig=g_social,  package='premium',  amount=1999, status='completed',   requirements='Social media graphics kit for my fashion brand — 15 posts for Instagram.'),
    dict(buyer=emily, seller=sara,   gig=g_press,   package='basic',    amount=799,  status='delivered',   requirements='Press release for our startup funding announcement round A.'),
    dict(buyer=emily, seller=kiran,  gig=g_seo,     package='standard', amount=999,  status='pending',     requirements='Keyword research for our beauty and skincare blog targeting India and UAE.'),

    # ── MICHAEL (buyer) ──
    dict(buyer=michael, seller=ranvir, gig=g_landing, package='standard', amount=1999, status='completed',   requirements='Landing page for my SaaS product — conversion-focused, mobile-first.'),
    dict(buyer=michael, seller=arjun,  gig=g_captions,package='basic',    amount=299,  status='completed',   requirements='Add captions to 5 short-form videos for my TikTok channel.'),
    dict(buyer=michael, seller=kiran,  gig=g_email,   package='standard', amount=1999, status='in_progress', requirements='Set up welcome and drip email sequences in Mailchimp for my SaaS app.'),
]

import random
from django.utils import timezone
from datetime import timedelta, datetime

order_objects = []
for o in ORDERS_DATA:
    if not Order.objects.filter(buyer=o['buyer'], gig=o['gig']).exists():
        order = Order.objects.create(**o)
        order_objects.append(order)
        print(f"  OK Order: {o['buyer'].first_name} -> {o['seller'].first_name} [{o['status']}]")
    else:
        order = Order.objects.get(buyer=o['buyer'], gig=o['gig'])
        order_objects.append(order)
        print(f"  -- Skipped order (exists): {o['buyer'].first_name} -> {o['gig'].title[:30]}")

    # Strict Timeline Logic based on delivery days
    delivery_days = getattr(order.gig, f'delivery_{order.package}')
    
    if order.status == 'completed':
        # Finished exactly delivery_days + 1 days after start, randomly in the past 6 months
        days_ago = random.randint(delivery_days + 5, 180)
        start_date = timezone.now() - timedelta(days=days_ago)
        completion_date = start_date + timedelta(days=delivery_days + 1)
        Order.objects.filter(id=order.id).update(created_at=start_date, updated_at=completion_date)
        
    elif order.status == 'delivered':
        # Finished recently (0-1 days ago), started exactly delivery_days + 1 days ago
        start_date = timezone.now() - timedelta(days=delivery_days + 1)
        completion_date = timezone.now() - timedelta(days=random.randint(0, 1))
        Order.objects.filter(id=order.id).update(created_at=start_date, updated_at=completion_date)
        
    elif order.status in ['in_progress', 'accepted']:
        # Started between 2 and delivery_days days ago
        days_ago = random.randint(2, max(2, delivery_days - 1))
        start_date = timezone.now() - timedelta(days=days_ago)
        Order.objects.filter(id=order.id).update(created_at=start_date)
        
    else:
        # Pending: started 0-1 days ago
        start_date = timezone.now() - timedelta(days=random.randint(0, 1))
        Order.objects.filter(id=order.id).update(created_at=start_date)

# ── REVIEWS (only on completed orders) ─────────────────────────────────────
REVIEWS_DATA = [
    dict(order_idx=0,  buyer=alex,    seller=ranvir, gig=g_webapp,  rating=5, comment='Ranvir delivered an exceptional full-stack app. Clean code, great communication, and delivered ahead of schedule!'),
    dict(order_idx=1,  buyer=alex,    seller=sneha,  gig=g_logo,   rating=5, comment='Sneha nailed the logo on the first try. Professional, modern, and exactly what I envisioned.'),
    dict(order_idx=4,  buyer=james,   seller=sneha,  gig=g_uiux,   rating=5, comment='Outstanding UI/UX work! The Figma prototype was incredibly detailed and the dark mode looks stunning.'),
    dict(order_idx=7,  buyer=david,   seller=sara,   gig=g_adcopy, rating=4, comment='Great ad copy, really captures our product well. High-converting and delivered on time.'),
    dict(order_idx=10, buyer=emily,   seller=sneha,  gig=g_social, rating=5, comment='Absolutely love the graphics! Every post looks premium. Got 3x more engagement this month.'),
    dict(order_idx=13, buyer=michael, seller=ranvir, gig=g_landing, rating=5, comment='The landing page looks stunning and loads super fast. Conversions are up 40% since launch!'),
    dict(order_idx=14, buyer=michael, seller=arjun,  gig=g_captions, rating=5, comment='Fast turnaround and perfect sync. My TikTok engagement doubled after adding captions!'),
]

for r in REVIEWS_DATA:
    order = order_objects[r['order_idx']]
    if not hasattr(order, 'review') or not Review.objects.filter(order=order).exists():
        Review.objects.create(
            order=order, buyer=r['buyer'], seller=r['seller'],
            gig=r['gig'], rating=r['rating'], comment=r['comment']
        )
        print(f"  OK Review: {r['buyer'].first_name} -> {r['seller'].first_name} ({r['rating']}star)")
    else:
        print(f"  -- Skipped review (exists)")

# ── MESSAGES ───────────────────────────────────────────────────────────────
MESSAGES_DATA = [
    dict(sender=alex,    receiver=ranvir, content='Hi Ranvir! I just placed an order. Can you confirm the tech stack you will be using?'),
    dict(sender=ranvir,  receiver=alex,   content='Hi Alex! Yes, I will use React 18, Django 4, JWT auth, and deploy on Render + Vercel. Will start today!'),
    dict(sender=alex,    receiver=ranvir, content='Perfect. Please make sure the admin panel is included as discussed.'),
    dict(sender=ranvir,  receiver=alex,   content='Absolutely! Admin panel with user management, gig moderation, and order tracking is included.'),

    dict(sender=james,   receiver=sneha,  content='Sneha, can you show me a preview of the UI/UX design before final delivery?'),
    dict(sender=sneha,   receiver=james,  content='Of course! I have attached a Figma prototype link. Please check and share feedback.'),
    dict(sender=james,   receiver=sneha,  content='Looks amazing! Just a small change — can you make the CTA button more prominent?'),
    dict(sender=sneha,   receiver=james,  content='Done! Updated the CTA with a gradient style and larger font. Let me know if this works!'),

    dict(sender=emily,   receiver=sara,   content='Sara, can you include a media contact list with the press release?'),
    dict(sender=sara,    receiver=emily,  content='Sure Emily! I will add a curated list of 20 Indian tech journalists and editors. Delivering tomorrow.'),

    dict(sender=david,   receiver=kiran,  content='Kiran, what is our estimated ROAS for the Google Ads campaign?'),
    dict(sender=kiran,   receiver=david,  content='Based on your niche, I am targeting 3-5x ROAS. I will share a detailed weekly report every Monday.'),

    dict(sender=michael, receiver=arjun,  content='Arjun, please add animated text captions not just plain subtitles for my TikTok videos.'),
    dict(sender=arjun,   receiver=michael, content='Got it Michael! I will use animated kinetic captions in your brand colors. Looks much more engaging!'),
]

for m in MESSAGES_DATA:
    if not Message.objects.filter(sender=m['sender'], receiver=m['receiver'], content=m['content']).exists():
        Message.objects.create(**m)
print(f"  OK Messages: Ensured unique messages created")

# ── FAVOURITES ──────────────────────────────────────────────────────────────
FAV_DATA = [
    dict(user=alex,    gig=g_uiux),
    dict(user=alex,    gig=g_youtube),
    dict(user=james,   gig=g_webapp),
    dict(user=james,   gig=g_seo),
    dict(user=david,   gig=g_logo),
    dict(user=emily,   gig=g_api),
    dict(user=emily,   gig=g_promo),
    dict(user=michael, gig=g_blog),
    dict(user=michael, gig=g_social),
]

for f in FAV_DATA:
    if not Favourite.objects.filter(user=f['user'], gig=f['gig']).exists():
        Favourite.objects.create(**f)
print(f"  OK Favourites: {len(FAV_DATA)} saved")

# ── RANDOM EXTRA ORDERS ───────────────────────────────────────────────────
if Order.objects.count() < 30:
    print("Generating balanced random orders for realistic history...")
    buyers_list = [alex, james, david, emily, michael]
    sellers_list = [ranvir, sneha, sara, arjun, kiran]
    packages = ['basic', 'standard', 'premium']
    
    # Generate 3-4 extra orders per seller total (across their gigs)
    for seller in sellers_list:
        seller_gigs = list(Gig.objects.filter(seller=seller))
        if not seller_gigs: continue
        
        num_orders = random.randint(3, 4)
        for _ in range(num_orders):
            buyer = random.choice(buyers_list)
            gig = random.choice(seller_gigs)
            pkg = random.choice(packages)
            status = random.choice(['completed', 'completed', 'delivered', 'in_progress', 'pending'])
            amount = getattr(gig, f'price_{pkg}')
            
            order = Order.objects.create(
                buyer=buyer, seller=seller, gig=gig,
                package=pkg, status=status, amount=amount,
                requirements='Randomly generated requirements for this order.'
            )
            
            # Timeline logic based on gig delivery time
            delivery_days = getattr(gig, f'delivery_{pkg}')
            
            if status == 'completed':
                days_ago = random.randint(delivery_days + 5, 180)
                start_date = timezone.now() - timedelta(days=days_ago)
                completion_date = start_date + timedelta(days=delivery_days + 1)
                Order.objects.filter(id=order.id).update(created_at=start_date, updated_at=completion_date)
                
                Review.objects.create(
                    order=order, buyer=buyer, seller=gig.seller, gig=gig,
                    rating=random.choice([4, 5, 5, 5]), comment='Excellent work! Highly recommended.'
                )
                
                # Sync gig stats
                gig.orders_completed += 1
                gig.review_count += 1
                gig.save()
                
            elif status == 'delivered':
                start_date = timezone.now() - timedelta(days=delivery_days + 1)
                completion_date = timezone.now() - timedelta(days=random.randint(0, 1))
                Order.objects.filter(id=order.id).update(created_at=start_date, updated_at=completion_date)
                
            elif status in ['in_progress', 'accepted']:
                days_ago = random.randint(2, max(2, delivery_days - 1))
                start_date = timezone.now() - timedelta(days=days_ago)
                Order.objects.filter(id=order.id).update(created_at=start_date)
                
            else:
                start_date = timezone.now() - timedelta(days=random.randint(0, 1))
                Order.objects.filter(id=order.id).update(created_at=start_date)

print("\n" + "="*55)
print("Done! Summary:")
print("  11 users  (5 sellers, 5 buyers, 1 admin)")
print("  16 gigs   (3-4 per seller)")
print(f"  {Order.objects.count()} orders (mixed statuses)")
print(f"  {Review.objects.count()} reviews")
print("  14 messages across conversations")
print("   9 favourites")
print("\nLogin credentials:")
print("  Sellers: ranvir/sneha/sara/arjun/kiran  -> demo1234")
print("  Buyers:  alex/james/david/emily/michael -> demo1234")
print("  Admin:   admin                          -> admin1234")
print("="*55)
