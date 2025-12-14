from django.shortcuts import render,redirect
from django.contrib.auth import authenticate,login,logout
from .models import User

# Create your views here.
def ui(request):

    return render(request, 'inter.html')
def homepage(request):

    return render(request, 'index.html')

def loginpage(request):
    context={
        "error":""
    }
    if request.method=="POST":
        print(request.POST)
        user=authenticate(username=request.POST['id'],password=request.POST['pass'])
        print(user)
        if user is not None:
            login(request,user)
            return redirect('/rsin/bill/')
        else:
            context={
                "error":"*invalid login"
            }
            return render(request,'emp.html',context)
    return render(request, 'emp.html',context)    
def userpage(request):

    if request.method=="POST":
        print(request.POST)
        emp=authenticate(username=request.POST['id'],password=request.POST['pass'])
        print(emp)
        if emp is not None:
            login(request,emp)
            return redirect('/rsin/ui/')
        else:
            context={
                "error":"*invalid login"
            }
            return render(request,'user.html',context)
    return render(request, 'user.html')

def log(request):
    logout(request)
    return redirect('/rsin/home/')    

def signup(request):
    context={
                "error":""
            }
    if request.method=="POST":
        user_check=User.objects.filter(username=request.POST['id'])
        if len(user_check)>0:
                context={
                "error":"*Exisisting User"
            }
                return render(request, 'signup.html',context)
        else:
                  
            new_user=User(username=request.POST['id'],first_name=request.POST['fn'],
            last_name=request.POST['ln'],email=request.POST['em'],age=request.POST['age'])
            new_user.set_password(request.POST['pass'])
            new_user.save()
            return redirect('/rsin/home/')  
     
    
    return render(request, 'signup.html',context)
    