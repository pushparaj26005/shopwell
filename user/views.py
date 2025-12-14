from django.shortcuts import render, redirect
from .forms import *
from.models import *
def db(request):
    
    context={
        'US':User.objects.all()
    }
    return render(request,'user_details.html',context)

def user_home(request):
    context={
        'rmsform':UserForm()
    }
    if request.method=="POST":
        us=UserForm(request.POST)
        if us.is_valid():
            us.save()
            return redirect('/user/table')
    return render(request,'user_add.html',context)

def user_delete(request, id):
    user = User.objects.get(id=id)
    user.delete()
    return redirect('/user/home')


def update(request,id):
    proe=User.objects.get(id=id)
    context = {
        'form': UserForm(instance=proe)
    }
    if request.method == "POST":
        rsdb = UserForm(request.POST, instance=proe)
        if rsdb.is_valid():
            rsdb.save()
            return redirect('/user/home')

    return render(request, 'user_add.html', context)
def oder(request):
    context={
        'rmsform':ods()
    }
    if request.method=="POST":
        us=ods(request.POST)
        if us.is_valid():
            us.save()
            return redirect('/rsin/home')
    return render(request,'oders.html',context)