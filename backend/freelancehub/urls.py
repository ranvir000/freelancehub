from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({'status': 'ok'})

def seed_database(request):
    from api.models import User, Gig, Order
    results = []

    USERS = [
        dict(username='ranvir', first_name='Ranvir', last_name='Singh', email='ranvir@demo.com', role='seller', password='demo1234'),
        dict(username='priya', first_name='Priya', last_name='Kapoor', email='priya@demo.com', role='seller', password='demo1234'),
        dict(username='sara', first_name='Sara', last_name='Liu', email='sara@demo.com', role='seller', password='demo1234'),
        dict(username='alex', first_name='Alex', last_name='Morgan', email='alex@demo.com', role='buyer', password='demo1234'),
        dict(username='james', first_name='James', last_name='Taylor', email='james@demo.com', role='buyer', password='demo1234'),
        dict(username='admin1', first_name='Admin', last_name='User', email='admin@demo.com', role='admin', password='admin1234'),
    ]

    created_users = {}
    for u in USERS:
        pw = u.pop('password')
        if not User.objects.filter(email__iexact=u['email']).exists():
            user = User.objects.create_user(password=pw, **u)
            created_users[u['username']] = user
            results.append(f"Created user: {user.name} ({user.role})")
        else:
            created_users[u['username']] = User.objects.get(email__iexact=u['email'])
            results.append(f"Skipped (exists): {u['email']}")

    # Create gigs
    if 'ranvir' in created_users and 'priya' in created_users and 'sara' in created_users:
        ranvir = created_users['ranvir']
        priya = created_users['priya']
        sara = created_users['sara']

        GIGS = [
            dict(seller=ranvir, title='I will build a full-stack web app with React and Django', description='Complete web app with JWT auth, REST API, and responsive React frontend.', category='Development', price_basic=2499, price_standard=4999, price_premium=8999, delivery_basic=7, delivery_standard=14, delivery_premium=21, rating=4.9, review_count=48, orders_completed=48),
            dict(seller=priya, title='I will design a modern logo for your brand', description='Professional logo with 3 unique concepts and vector files.', category='Design', price_basic=999, price_standard=1999, price_premium=3999, delivery_basic=3, delivery_standard=5, delivery_premium=10, rating=4.8, review_count=128, orders_completed=128),
            dict(seller=sara, title='I will write SEO-optimized blog posts', description='Professional content writing with keyword research.', category='Writing', price_basic=499, price_standard=999, price_premium=1999, delivery_basic=2, delivery_standard=4, delivery_premium=7, rating=4.9, review_count=203, orders_completed=203),
        ]

        for g in GIGS:
            if not Gig.objects.filter(title=g['title']).exists():
                Gig.objects.create(**g)
                results.append(f"Created gig: {g['title'][:50]}")
            else:
                results.append(f"Skipped gig: {g['title'][:50]}")

    return JsonResponse({
        'success': True,
        'results': results,
        'login_credentials': {
            'sellers': ['ranvir@demo.com / demo1234', 'priya@demo.com / demo1234', 'sara@demo.com / demo1234'],
            'buyers': ['alex@demo.com / demo1234', 'james@demo.com / demo1234'],
            'admin': ['admin@demo.com / admin1234'],
        }
    }, json_dumps_params={'indent': 2})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/health/', health_check),
    path('api/seed/', seed_database),
]
