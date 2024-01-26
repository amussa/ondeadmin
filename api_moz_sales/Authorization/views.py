from rest_framework import permissions
from knox.models import AuthToken
from knox.views import LoginView as KnoxLoginView
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from Profile.models import Person
from knox.auth import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

# Create your views here.
class LoginAPI(KnoxLoginView):
    permission_classes = (permissions.AllowAny,)
    def post(self, request, format=None):
        try:
            serializer = AuthTokenSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data['user']
            grupo = None
            identifica = None
            if user.groups.exists():
                grupo = user.groups.all()[0].name
                identifica = user.id
            _, token = AuthToken.objects.create(user=user)

            entName=None
            entID=None
            try:
                person=Person.objects.get(user=user)
                name=person.name
            except:
                pass

            return Response(data={'token': token, 'grupo': grupo, 'name':name, 'username':user.username, 'status':200}, status=200)
        except AuthenticationFailed as e:
            return Response(data={'message': str(e)}, status=401)
        except Exception as e:
            return Response(data={'message': 'Erro no login'}, status=500)


class ValidateTokenView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({'message': 'Token válido.'}, status=200)