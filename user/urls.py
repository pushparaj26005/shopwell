from django.urls import path
from .views import *

urlpatterns = [
    path('table/',db),
    path('home/', user_home),
    path('update/<int:id>/',update, name='update'),
    path('delete/<int:id>/', user_delete, name='user_delete'),
    path('od/',oder),
]
