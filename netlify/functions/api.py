import os
from mangum import Mangum
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rms.settings')

# Run migrations if on Netlify lambda
if os.environ.get('NETLIFY') == 'true':
    from django.core.management import call_command
    try:
        call_command('migrate', interactive=False)
    except Exception as e:
        print("Migration failed:", e)

# Create the WSGI application
application = get_wsgi_application()

# Mangum works with ASGI natively but can wrap WSGI or we can just import ASGI
# Let's import the ASGI one to be safer for Mangum:
from rms.asgi import application as asgi_application

handler = Mangum(asgi_application, lifespan="off")
