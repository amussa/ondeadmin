from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class ProductCategory(models.Model):
    id=models.AutoField(primary_key=True)
    name=models.CharField(max_length=50)

    class Meta:
        db_table='product_category'
    def __str__(self):
        return self.name
class Product(models.Model):
    id=models.AutoField(primary_key=True)
    name=models.CharField(max_length=50)
    category=models.ForeignKey(ProductCategory, on_delete=models.CASCADE)
    price=models.FloatField()
    unit=models.CharField(max_length=50)
    status=models.CharField(max_length=50, default='Active')

    class Meta:
        db_table='product'
    def __str__(self):
        return f'{self.id}-{self.name}'

class ProductActions(models.Model):
    id=models.AutoField(primary_key=True)
    product=models.ForeignKey(Product, on_delete=models.CASCADE)
    action=models.CharField(max_length=50)
    date=models.DateTimeField(auto_now_add=True)
    user=models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        db_table='product_actions'
    def __str__(self):
        return f'{self.action} on Product {self.product.name} by {self.user.username}'

