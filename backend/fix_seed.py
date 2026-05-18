import sys

with open('seed.py', 'r', encoding='utf-8') as f:
    content = f.read()

top_part = content.split('# ── ORDERS ─────────────────────────────────────────────────────────────────')[0]

new_logic = """# ── ORDERS, REVIEWS, AND EARNINGS SYNC ────────────────────────────────────
print("Generating completely dynamic and balanced orders for presentation...")

REVIEW_TEMPLATES = {
    'Development': ["Exceptional code quality!", "Delivered ahead of schedule. Highly recommended.", "Great communication and solid architecture.", "Exactly what I needed. Will hire again."],
    'Design': ["Stunning visuals!", "Nailed the design on the first try.", "Very creative and responsive to feedback.", "Premium quality work."],
    'Writing': ["Perfect grammar and very engaging.", "SEO optimized and ready to publish.", "Captured my brand voice perfectly.", "High converting copy, very impressed."],
    'Video': ["Great editing and pacing.", "Fast turnaround and high quality.", "The transitions and music were perfect.", "Doubled my engagement!"],
    'Marketing': ["Great ROI on this campaign.", "Very knowledgeable and data-driven.", "Grew my followers significantly.", "Excellent strategy and execution."]
}

buyers_list = [alex, james, david, emily, michael]
sellers_list = [ranvir, sneha, sara, arjun, kiran]
packages = ['basic', 'standard', 'premium']

import random
from django.utils import timezone
from datetime import timedelta

Order.objects.all().delete()
Review.objects.all().delete()

buyer_counts = {b: 0 for b in buyers_list}
statuses_pool = ['completed', 'in_progress', 'pending', 'accepted', 'delivered', 'completed']

for seller in sellers_list:
    seller_gigs = list(Gig.objects.filter(seller=seller))
    if not seller_gigs: continue
    
    num_orders = random.randint(3, 4)
    
    # Shuffle statuses so each seller gets a diverse mix of states
    seller_statuses = statuses_pool.copy()
    random.shuffle(seller_statuses)
    
    for _ in range(num_orders):
        # Pick a buyer who has the least amount of orders to balance them perfectly
        min_count = min(buyer_counts[b] for b in buyers_list)
        lowest_buyers = [b for b in buyers_list if buyer_counts[b] == min_count]
        buyer = random.choice(lowest_buyers)
        buyer_counts[buyer] += 1
        
        gig = random.choice(seller_gigs)
        pkg = random.choice(packages)
        status = seller_statuses.pop()
        amount = getattr(gig, f'price_{pkg}')
        
        order = Order.objects.create(
            buyer=buyer, seller=seller, gig=gig,
            package=pkg, status=status, amount=amount,
            requirements='Please deliver exactly as described in the gig package. Looking forward to it!'
        )
        print(f"  OK Order: {buyer.first_name} -> {seller.first_name} [{status}]")
        
        delivery_days = getattr(gig, f'delivery_{pkg}')
        
        # Strict timeline logic
        if status == 'completed':
            days_ago = random.randint(delivery_days + 5, 180)
            start_date = timezone.now() - timedelta(days=days_ago)
            completion_date = start_date + timedelta(days=delivery_days + 1)
            Order.objects.filter(id=order.id).update(created_at=start_date, updated_at=completion_date)
            
            # Attach Review
            comment = random.choice(REVIEW_TEMPLATES.get(gig.category, ["Great work!", "Highly recommended."]))
            Review.objects.create(
                order=order, buyer=buyer, seller=seller, gig=gig,
                rating=random.choice([4, 5, 5, 5]), comment=comment
            )
            
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

print("Syncing perfect mathematical earnings and stats...")
# Mathematically sync all seller earnings and gig stats based ONLY on actual generated orders
for seller in sellers_list:
    completed_orders = Order.objects.filter(seller=seller, status='completed')
    total_earned = sum(o.amount for o in completed_orders)
    User.objects.filter(id=seller.id).update(total_earnings=total_earned)
    
    for gig in Gig.objects.filter(seller=seller):
        gig_completed = Order.objects.filter(gig=gig, status='completed').count()
        gig_reviews = Review.objects.filter(gig=gig)
        
        avg_rating = 0.0
        if gig_reviews.exists():
            avg_rating = float(sum(r.rating for r in gig_reviews)) / float(gig_reviews.count())
            
        Gig.objects.filter(id=gig.id).update(
            orders_completed=gig_completed,
            review_count=gig_reviews.count(),
            rating=avg_rating
        )

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

print("\\n" + "="*55)
print("Done! Summary:")
print("  11 users  (5 sellers, 5 buyers, 1 admin)")
print("  16 gigs   (3-4 per seller)")
print(f"  {Order.objects.count()} orders (mixed statuses)")
print(f"  {Review.objects.count()} reviews")
print("  14 messages across conversations")
print("   9 favourites")
print("\\nLogin credentials:")
print("  Sellers: ranvir/sneha/sara/arjun/kiran  -> demo1234")
print("  Buyers:  alex/james/david/emily/michael -> demo1234")
print("  Admin:   admin                          -> admin1234")
print("="*55)
"""

with open('seed.py', 'w', encoding='utf-8') as f:
    f.write(top_part + new_logic)
