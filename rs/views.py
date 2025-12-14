from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import now
import json

from .forms import *
from .models import *


# ---------------- HOME & AUTH PAGES ----------------

def home(request):
    return render(request, 'index.html')


def logine(request):
    return render(request, 'emp.html')


def loginu(request):
    return render(request, 'user.html')


# ---------------- BILLING PAGE ----------------

def bill(request):
    customers = rdb.objects.all()   # existing customers
    items = pro.objects.all()       # products/items
    return render(
        request,
        'billing-table.html',
        {
            'customers': customers,
            'items': items
        }
    )


# ---------------- SIGNUP ----------------

def sign(request):
    context = {'rmsform': rmsform()}
    if request.method == "POST":
        form = rmsform(request.POST)
        if form.is_valid():
            form.save()
            return redirect('/rsin/home')
    return render(request, 'sign.html', context)


# ---------------- PASSWORD ----------------

def up(request):
    context = {'pas': pas()}
    if request.method == "POST":
        form = pas(request.POST)
        if form.is_valid():
            form.save()
    return render(request, 'for.html', context)


# ---------------- CUSTOMER TABLE ----------------

def db(request):
    context = {'rd': rdb.objects.all()}
    return render(request, 'pro.html', context)


def dele(request, id):
    obj = rdb.objects.get(id=id)
    obj.delete()
    return redirect('/rsin/table')


def update(request, id):
    obj = rdb.objects.get(id=id)
    context = {"rs": rmsform(instance=obj)}
    return render(request, 'pro.html', context)


# ---------------- SAVE INVOICE (MAIN LOGIC) ----------------

@csrf_exempt
def save_invoice(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=400)

    try:
        data = json.loads(request.body)

        # CREATE INVOICE
        invoice = Invoice.objects.create(
            invoice_number=data.get("invoiceNumber", f"INV-{Invoice.objects.count()+1}"),
            due_date=data.get("dueDate"),
            client_name=data["client"].get("name", ""),
            client_address=data["client"].get("address", ""),
            client_email=data["client"].get("email", ""),
            company_name=data["company"].get("name", ""),
            company_address=data["company"].get("address", ""),
            company_email=data["company"].get("email", ""),
            subtotal=data["totals"].get("subtotal", 0),
            tax=data["totals"].get("tax", 0),
            discount=data["totals"].get("discount", 0),
            total=data["totals"].get("grandTotal", 0),
            notes=data.get("notes", "")
        )

        # CREATE INVOICE ITEMS
        for item in data.get("items", []):
            qty = int(item.get("quantity", 1))
            price = float(item.get("unitPrice", 0))
            total = qty * price

            InvoiceItem.objects.create(
                invoice=invoice,
                item_name=item.get("item", ""),
                quantity=qty,
                price=price,
                total=total
            )

        return JsonResponse({
            "success": True,
            "invoice_id": invoice.id
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
# -----------login----------
def ui(request):

    return render(request, 'inter.html')
    
