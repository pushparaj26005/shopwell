from django.db import models

class pro(models.Model):
    name = models.CharField(max_length=500, null=True)
    code = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    quantity = models.IntegerField(default=0)
    gst = models.FloatField(default=0.5)

    def __str__(self):
        return self.name


class rdb(models.Model):
    name = models.CharField(max_length=500)
    password=models.CharField(max_length=500,default="000")
    address = models.CharField(max_length=128)
    phone_number = models.CharField(max_length=15)
    age = models.IntegerField(default=0)
    

    def __str__(self):
        return self.name


class password(models.Model):
    npassword = models.CharField(max_length=128)
    opassword = models.CharField(max_length=128)


class Invoice(models.Model):
    invoice_number = models.CharField(max_length=50, unique=True)
    date = models.DateField(auto_now_add=True)
    due_date = models.DateField(null=True, blank=True)   
    client_name = models.CharField(max_length=100)
    client_address = models.TextField()
    client_email = models.EmailField()
    company_name = models.CharField(max_length=100)
    company_address = models.TextField()
    company_email = models.EmailField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.invoice_number


class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="items")
    item_name = models.CharField(max_length=100)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
