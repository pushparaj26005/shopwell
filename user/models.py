from django.db import models
from rs.models import *
class User(models.Model):
    name = models.CharField(max_length=500, null=True)
    code = models.IntegerField(default=0)

    def __str__(self):
        return self.name
class od(models.Model):
    cs=models.ForeignKey(User,on_delete=models.CASCADE,null=True)
   
    odeer_num=models.CharField(max_length=50,null=True)
    oder_date=models.DateField(null=True)
        
