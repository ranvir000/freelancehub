#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate

# Seed demo data (safe to re-run — skips existing entries)
echo "🌱 Running seed script..."
python seed.py || echo "⚠️ Seed script had issues, continuing anyway"
echo "✅ Build complete!"
