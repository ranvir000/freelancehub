from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Extended user with role, skills, location, avatar."""
    ROLES = [('buyer','Buyer'), ('seller','Seller'), ('admin','Admin')]
    role           = models.CharField(max_length=10, choices=ROLES, default='buyer')
    bio            = models.TextField(blank=True, default='')
    skills         = models.TextField(blank=True, default='')   # comma-separated
    location       = models.CharField(max_length=100, blank=True, default='')
    avatar_url     = models.URLField(blank=True, default='')
    hourly_rate    = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    total_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f'{self.get_full_name() or self.username} ({self.role})'

    @property
    def name(self):
        return self.get_full_name() or self.username

    @property
    def skills_list(self):
        return [s.strip() for s in self.skills.split(',') if s.strip()] if self.skills else []


class Gig(models.Model):
    """A service listing posted by a seller."""
    CATEGORIES = [
        ('Development','Development'), ('Design','Design'),
        ('Writing','Writing'),         ('Marketing','Marketing'),
        ('Video','Video'),             ('Data','Data'),
    ]

    seller      = models.ForeignKey(User, on_delete=models.CASCADE, related_name='gigs')
    title       = models.CharField(max_length=200)
    description = models.TextField()
    category    = models.CharField(max_length=50, choices=CATEGORIES, default='Development')

    price_basic    = models.DecimalField(max_digits=8, decimal_places=2)
    price_standard = models.DecimalField(max_digits=8, decimal_places=2)
    price_premium  = models.DecimalField(max_digits=8, decimal_places=2)

    delivery_basic    = models.IntegerField(default=7)
    delivery_standard = models.IntegerField(default=14)
    delivery_premium  = models.IntegerField(default=21)

    rating           = models.DecimalField(max_digits=3, decimal_places=1, default=5.0)
    review_count     = models.IntegerField(default=0)
    orders_completed = models.IntegerField(default=0)
    is_active        = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def price(self):
        return self.price_basic

    @property
    def seller_name(self):
        return self.seller.name


class Order(models.Model):
    """A transaction between buyer and seller."""
    STATUS = [
        ('pending',     'Pending'),
        ('accepted',    'Accepted'),
        ('in_progress', 'In Progress'),
        ('delivered',   'Delivered'),
        ('completed',   'Completed'),
        ('cancelled',   'Cancelled'),
    ]
    PACKAGES = [('basic','Basic'), ('standard','Standard'), ('premium','Premium')]

    buyer   = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders_bought')
    seller  = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders_sold')
    gig     = models.ForeignKey(Gig,  on_delete=models.CASCADE, related_name='orders')

    package      = models.CharField(max_length=10, choices=PACKAGES, default='standard')
    status       = models.CharField(max_length=15, choices=STATUS,   default='pending')
    amount       = models.DecimalField(max_digits=8, decimal_places=2)
    requirements = models.TextField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Order #{self.id} — {self.gig.title[:40]} [{self.status}]'

    @property
    def gig_title(self):
        return self.gig.title

    @property
    def buyer_name(self):
        return self.buyer.name

    @property
    def seller_name(self):
        return self.seller.name


class Review(models.Model):
    """Star rating and comment after order completion."""
    order   = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='review')
    buyer   = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')
    seller  = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received')
    gig     = models.ForeignKey(Gig,  on_delete=models.CASCADE, related_name='reviews')
    rating  = models.IntegerField(choices=[(i,i) for i in range(1,6)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.buyer.name} → {self.seller.name}: {self.rating}★"


class Message(models.Model):
    """Direct message between two users, optionally linked to an order."""
    sender   = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    order    = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='messages')
    content  = models.TextField()
    is_read  = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'{self.sender.name} → {self.receiver.name}: {self.content[:40]}'


class Favourite(models.Model):
    """A buyer's saved/bookmarked gig."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favourites')
    gig  = models.ForeignKey(Gig,  on_delete=models.CASCADE, related_name='favourited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'gig')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.name} ❤ {self.gig.title[:40]}'
