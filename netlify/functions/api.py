import os
from mangum import Mangum
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rms.settings')

# Run migrations if on Netlify lambda
if os.environ.get('IS_NETLIFY') == 'true':
    from django.core.management import call_command
    try:
        call_command('migrate', interactive=False)
    except Exception as e:
        print("Migration failed:", e)

from rms.asgi import application as asgi_application

# Strip the base Netlify function path so Django router recognizes the URL properly
mangum_handler = Mangum(asgi_application, lifespan="off", api_gateway_base_path="/.netlify/functions/api")

def handler(event, context):
    return mangum_handler(event, context)
