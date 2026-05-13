from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({'status': 'ok'})

def seed_database(request):
    from api.models import User, Gig, Order
    results = []

    USERS = [
        dict(username='ranvir', first_name='Ranvir', last_name='Singh', email='ranvir@gmail.com', role='seller', password='demo1234'),
        dict(username='priya', first_name='Priya', last_name='Kapoor', email='priya@gmail.com', role='seller', password='demo1234'),
        dict(username='sara', first_name='Sara', last_name='Liu', email='sara@gmail.com', role='seller', password='demo1234'),
        dict(username='amit', first_name='Amit', last_name='Verma', email='amit@gmail.com', role='seller', password='demo1234'),
        dict(username='kiran', first_name='Kiran', last_name='Mehta', email='kiran@gmail.com', role='seller', password='demo1234'),
        dict(username='arjun', first_name='Arjun', last_name='Patel', email='arjun@gmail.com', role='seller', password='demo1234'),
        dict(username='alex', first_name='Alex', last_name='Morgan', email='alex@gmail.com', role='buyer', password='demo1234'),
        dict(username='james', first_name='James', last_name='Taylor', email='james@gmail.com', role='buyer', password='demo1234'),
        dict(username='admin1', first_name='Admin', last_name='User', email='admin@gmail.com', role='admin', password='admin1234'),
    ]

    created_users = {}
    for u in USERS:
        pw = u.pop('password')
        try:
            user = User.objects.get(username=u['username'])
            if user.email != u['email']:
                user.email = u['email']
                user.save()
                results.append(f"Updated email for: {u['username']}")
            else:
                results.append(f"Skipped (exists): {u['username']}")
            created_users[u['username']] = user
        except User.DoesNotExist:
            user = User.objects.create_user(password=pw, **u)
            created_users[u['username']] = user
            results.append(f"Created user: {user.name} ({user.role})")

    # Create gigs
    if all(k in created_users for k in ['ranvir', 'priya', 'sara', 'amit', 'kiran', 'arjun']):
        ranvir = created_users['ranvir']
        priya = created_users['priya']
        sara = created_users['sara']
        amit = created_users['amit']
        kiran = created_users['kiran']
        arjun = created_users['arjun']

        GIGS = [
            dict(seller=ranvir, title='I will build a full-stack web app with React and Django', description='Complete web app with JWT auth, REST API, and responsive React frontend.', category='Development', price_basic=2499, price_standard=4999, price_premium=8999, delivery_basic=7, delivery_standard=14, delivery_premium=21, rating=4.9, review_count=48, orders_completed=48),
            dict(seller=ranvir, title='I will build a REST API with Django & PostgreSQL', description='Robust REST API with authentication and optimizations.', category='Development', price_basic=1999, price_standard=3999, price_premium=6999, delivery_basic=5, delivery_standard=10, delivery_premium=15, rating=5.0, review_count=32, orders_completed=32),
            
            dict(seller=priya, title='I will design a modern logo for your brand', description='Professional logo with 3 unique concepts and vector files.', category='Design', price_basic=999, price_standard=1999, price_premium=3999, delivery_basic=3, delivery_standard=5, delivery_premium=10, rating=4.8, review_count=128, orders_completed=128),
            dict(seller=priya, title='I will design a stunning UI/UX for your app', description='Figma designs that convert users and look beautiful.', category='Design', price_basic=1499, price_standard=2999, price_premium=5999, delivery_basic=4, delivery_standard=7, delivery_premium=14, rating=4.8, review_count=76, orders_completed=76),
            
            dict(seller=sara, title='I will write SEO-optimized blog posts', description='Professional content writing with keyword research.', category='Writing', price_basic=499, price_standard=999, price_premium=1999, delivery_basic=2, delivery_standard=4, delivery_premium=7, rating=4.9, review_count=203, orders_completed=203),
            dict(seller=sara, title='I will write professional technical documentation', description='Clear and concise documentation for your API or project.', category='Writing', price_basic=699, price_standard=1299, price_premium=2499, delivery_basic=3, delivery_standard=6, delivery_premium=10, rating=4.8, review_count=97, orders_completed=97),
            
            dict(seller=amit, title='I will create a responsive website with React', description='Fast, accessible, and responsive website built with modern React.', category='Development', price_basic=1499, price_standard=2499, price_premium=4999, delivery_basic=5, delivery_standard=10, delivery_premium=14, rating=4.7, review_count=89, orders_completed=89),
            
            dict(seller=kiran, title='I will create a social media marketing strategy', description='Grow your audience with a proven social media strategy.', category='Marketing', price_basic=799, price_standard=1499, price_premium=2999, delivery_basic=3, delivery_standard=7, delivery_premium=14, rating=4.7, review_count=61, orders_completed=61),
            dict(seller=kiran, title='I will run Google Ads campaigns and optimize ROI', description='Maximize your return on ad spend with optimized Google Ads.', category='Marketing', price_basic=1299, price_standard=2499, price_premium=4999, delivery_basic=5, delivery_standard=14, delivery_premium=30, rating=4.6, review_count=38, orders_completed=38),
            
            dict(seller=arjun, title='I will build a mobile app with React Native', description='Cross-platform mobile application for iOS and Android.', category='Development', price_basic=3499, price_standard=6999, price_premium=12999, delivery_basic=14, delivery_standard=30, delivery_premium=45, rating=4.9, review_count=44, orders_completed=44),
            dict(seller=arjun, title='I will set up a CI/CD pipeline with GitHub Actions', description='Automate your testing and deployment workflows.', category='Development', price_basic=1799, price_standard=2999, price_premium=4999, delivery_basic=4, delivery_standard=7, delivery_premium=10, rating=4.8, review_count=29, orders_completed=29),
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
            'sellers': ['ranvir@gmail.com', 'priya@gmail.com', 'sara@gmail.com', 'amit@gmail.com', 'kiran@gmail.com', 'arjun@gmail.com'],
            'buyers': ['alex@gmail.com', 'james@gmail.com'],
            'admin': ['admin@gmail.com'],
            'password_for_all': 'demo1234'
        }
    }, json_dumps_params={'indent': 2})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/health/', health_check),
    path('api/seed/', seed_database),
]
