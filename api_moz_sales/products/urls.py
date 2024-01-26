from django.urls import path
from .views import *

urlpatterns = [
    path('register-product/', create_product.as_view(), name='register'),
    path('register-product-category/', create_product_category.as_view(), name='register-category'),
    path('update-product/', update_product.as_view(), name='update-product'),
    path('change-product-status/', change_product_status.as_view(), name='status-product'),
    path('list-products/', list_products.as_view(), name='list-products'),
    path('list-product-category/', list_product_category.as_view(), name='list-product-category'),
]