from django.db import models
from django.contrib.auth.models import User


class Person(models.Model):
    name = models.CharField(
        max_length=250, db_column="name", null=True, blank=True)
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, db_column="user")
    email = models.EmailField(
        db_column="email", null=True, blank=True)

    class Meta:
        db_table = 'person'

    def __str__(self):
        return self.name
