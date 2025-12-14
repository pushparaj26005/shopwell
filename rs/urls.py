
from django.urls import path

from .views import *
urlpatterns = [
    path('home/',home),
    path('login/',logine),
    path('user/',loginu),
    path('sign/',sign),
    path('fog/',up),
    path('table/',db),
    path('table_delete/<int:id>/',dele,name='prod'),  
    path('table_update/<int:id>/',update,name='prod_up'),
    path('bill/', bill),
    path('save-invoice/', save_invoice, name='save_invoice'), 
    path('ui/',ui),   
]
