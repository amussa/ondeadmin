from rest_framework.response import Response
from .serializers import *
from knox.auth import TokenAuthentication
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import *
from django.db import transaction
# Create your views here.

class create_product_category(generics.CreateAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            data=self.request.data['form']
            user=request.user
            usuario=User.objects.get(username=user)

            for i in data:
                new_product_category=ProductCategory.objects.create(
                    name=i['name']
                )
            return Response(status=201)
        except KeyError as e:
            return Response({'error': 'Form key is missing'}, status=400)
        except Exception as e:
            return Response({'error': 'An error occurred'}, status=500)

class list_product_category(generics.ListAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = ProductCategorySerializer
    def get_queryset(self):
        try:
            queryset = ProductCategory.objects.all()
            return queryset
        except Exception as e:
            return Response({'error': 'An error occurred'}, status=500)

class create_product(generics.CreateAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            data = self.request.data['form']
            user = request.user
            usuario = User.objects.get(username=user)

            with transaction.atomic():
                # CREATE PRODUCT
                new_product = Product.objects.create(
                    name=data['name'],
                    category=ProductCategory.objects.get(id=data['category']),
                    price=data['price'],
                    unit=data['unit'],
                )
                # CREATE PRODUCT ACTION
                product_action = ProductActions.objects.create(
                    product=new_product,
                    action='REGISTER',
                    user=usuario
                )

            return Response(status=201)

        except KeyError as e:
            return Response({'error': 'Form key is missing'}, status=400)
        except ProductCategory.DoesNotExist as e:
            return Response({'error': 'Invalid category ID'}, status=400)
        except User.DoesNotExist as e:
            return Response({'error': 'Invalid user ID'}, status=400)
        except Exception as e:
            return Response({'error': 'An error occurred'}, status=500)

class update_product(generics.UpdateAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def put(self, request, *args, **kwargs):
        try:
            user = request.user
            usuario = User.objects.get(username=user)
            data = self.request.data['form']
            with transaction.atomic():
                product = Product.objects.get(id=data['id'])
                product.name = data['name']
                product.category = ProductCategory.objects.get(id=data['category'])
                product.price = data['price']
                product.unit = data['unit']
                product.save()

                product_action = ProductActions.objects.create(
                    product=product,
                    action='UPDATE',
                    user=usuario
                )
            return Response({'success':'Object was succesfully updated'},status=204)
        except KeyError as e:
            return Response({'error': 'Form key is missing'}, status=400)
        except Product.DoesNotExist as e:
            return Response({'error': 'Invalid product ID'}, status=400)
        except ProductCategory.DoesNotExist as e:
            return Response({'error': 'Invalid category ID'}, status=400)
        except User.DoesNotExist as e:
            return Response({'error': 'Invalid user ID'}, status=400)
        except Exception as e:
            return Response({'error': 'An error occurred'}, status=500)

class change_product_status(generics.UpdateAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        try:
            user = request.user
            usuario = User.objects.get(username=user)
            data = self.request.data['form']
            with transaction.atomic():
                update_product = Product.objects.get(id=data['id'])
                update_product.status = data['status']
                update_product.save()

                product_action = ProductActions.objects.create(
                    product=update_product,
                    action='CHANGE STATUS',
                    user=usuario
                )
            return Response({'success':'Object was succesfully updated'},status=204)
        except KeyError as e:
            return Response({'error': 'Form key is missing'}, status=400)
        except Product.DoesNotExist as e:
            return Response({'error': 'Invalid product ID'}, status=400)
        except User.DoesNotExist as e:
            return Response({'error': 'Invalid user ID'}, status=400)
        except Exception as e:
            return Response({'error': 'An error occurred'}, status=500)

class list_products(generics.ListAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = ProductSerializer
    def get_queryset(self):
        try:
            queryset = Product.objects.filter(status='Active')
            return queryset
        except Exception as e:
            return Response({'error': 'An error occurred'}, status=500)