from django.urls import path
from .views import *

urlpatterns = [
    path('signin/', LoginAPI.as_view(), name='login'),
    path('validate_token/', ValidateTokenView.as_view(), name='logout'),
]