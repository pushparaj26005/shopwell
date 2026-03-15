"""
WSGI config for rms project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rms.settings')

application = get_wsgi_application()

if os.environ.get('VERCEL') == '1':
    from django.core.management import call_command
    import os
    try:
        call_command('migrate', interactive=False)
        
        # Ensure the tmp static directory exists
        os.makedirs('/tmp/staticfiles', exist_ok=True)
        call_command('collectstatic', interactive=False, clear=True)
    except Exception as e:
        print("Startup failed:", e)
