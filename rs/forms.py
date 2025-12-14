from django.forms import ModelForm
from .models import *
class rmsform(ModelForm):
    class Meta:
        model=rdb
        fields='__all__'
class pas(ModelForm):
    class Meta:
        model=password
        fields='__all__'      

class invoiceform(ModelForm):
    class Meta:
        model = Invoice
        fields = '__all__'


class invoiceitemform(ModelForm):
    class Meta:
        model = InvoiceItem
        fields = '__all__'        