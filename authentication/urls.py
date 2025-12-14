from django.urls import path
from .views import *
from .import views
app_name='authentication'
urlpatterns=[
    path('',homepage),
    path('login/', views.loginpage, name='login'),
    path('userpage/', views.userpage, name='userpage'),
    path('logout/',log),
    path('signup/',views.signup,name='signup'),      
]