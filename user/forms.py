from django.forms import ModelForm
from .models import *

class UserForm(ModelForm):
    class Meta:
        model = User
        fields = '__all__'
class ods(ModelForm):
    class Meta:
        model = od
        fields = '__all__'
                
