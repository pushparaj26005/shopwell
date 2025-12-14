// Modern Billing Table JavaScript
class BillingTable {
    constructor() {
        this.items = [];
        this.taxRate = 10;
        this.currency = '$';
        this.sortDirection = {};
        this.selectedRows = new Set();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setCurrentDate();
        this.addInitialRow();
        this.calculateTotals();
    }

    setupEventListeners() {
        // Add row button
        document.getElementById('add-row').addEventListener('click', () => this.addRow());
        
        // Tax rate change
        document.getElementById('tax-rate').addEventListener('input', (e) => {
            this.taxRate = parseFloat(e.target.value) || 0;
            this.calculateTotals();
        });
        
        // Search functionality
        document.getElementById('search').addEventListener('input', (e) => {
            this.filterTable(e.target.value);
        });
        
        // Select all checkbox
        document.getElementById('select-all').addEventListener('change', (e) => {
            this.selectAllRows(e.target.checked);
        });
        
        // Action buttons
        document.getElementById('save-invoice').addEventListener('click', () => this.saveInvoice());
        document.getElementById('print-invoice').addEventListener('click', () => this.printInvoice());
        document.getElementById('export-pdf').addEventListener('click', () => this.exportPDF());
        document.getElementById('clear-all').addEventListener('click', () => this.clearAll());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('invoice-date').textContent = today;
        
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        document.getElementById('due-date').value = dueDate.toISOString().split('T')[0];
    }

    addInitialRow() {
        this.addRow();
    }

    addRow(data = {}) {
        const rowId = 'row-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        const row = {
            id: rowId,
            item: data.item || '',
            description: data.description || '',
            quantity: data.quantity || 1,
            unitPrice: data.unitPrice || 0,
            discount: data.discount || 0,
            selected: false
        };
        
        this.items.push(row);
        this.renderRow(row);
        this.calculateTotals();
        
        // Focus on first input of new row
        setTimeout(() => {
            const input = document.querySelector(`#${rowId} input[name="item"]`);
            if (input) input.focus();
        }, 100);
    }

    renderRow(row) {
        const tbody = document.getElementById('table-body');
        const tr = document.createElement('tr');
        tr.id = row.id;
        tr.className = 'new-row';
        
        tr.innerHTML = `
            <td>
                <input type="checkbox" class="row-select" data-row-id="${row.id}">
            </td>
            <td>
                <input type="text" name="item" value="${row.item}" placeholder="Item name" 
                       onchange="billing.updateRow('${row.id}', 'item', this.value)">
            </td>
            <td>
                <input type="text" name="description" value="${row.description}" placeholder="Description"
                       onchange="billing.updateRow('${row.id}', 'description', this.value)">
            </td>
            <td>
                <input type="number" name="quantity" value="${row.quantity}" min="0" step="1"
                       class="number-input"
                       onchange="billing.updateRow('${row.id}', 'quantity', parseFloat(this.value) || 0)">
            </td>
            <td>
                <input type="number" name="unitPrice" value="${row.unitPrice}" min="0" step="0.01"
                       class="number-input"
                       onchange="billing.updateRow('${row.id}', 'unitPrice', parseFloat(this.value) || 0)">
            </td>
            <td>
                <input type="number" name="discount" value="${row.discount}" min="0" max="100" step="0.1"
                       class="number-input"
                       onchange="billing.updateRow('${row.id}', 'discount', parseFloat(this.value) || 0)">
            </td>
            <td class="currency" id="${row.id}-subtotal">${this.currency}0.00</td>
            <td class="currency" id="${row.id}-tax">${this.currency}0.00</td>
            <td class="currency" id="${row.id}-total">${this.currency}0.00</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="billing.removeRow('${row.id}')" 
                        title="Remove Row">🗑️</button>
            </td>
        `;
        
        tbody.appendChild(tr);
        
        // Add event listener for row selection
        const checkbox = tr.querySelector('.row-select');
        checkbox.addEventListener('change', (e) => {
            this.toggleRowSelection(row.id, e.target.checked);
        });
        
        // Calculate row totals
        this.calculateRowTotal(row.id);
    }

    updateRow(rowId, field, value) {
        const rowIndex = this.items.findIndex(item => item.id === rowId);
        if (rowIndex !== -1) {
            this.items[rowIndex][field] = value;
            this.calculateRowTotal(rowId);
        }
    }

    calculateRowTotal(rowId) {
        const row = this.items.find(item => item.id === rowId);
        if (!row) return;
        
        const subtotal = row.quantity * row.unitPrice;
        const discountAmount = subtotal * (row.discount / 100);
        const taxableAmount = subtotal - discountAmount;
        const taxAmount = taxableAmount * (this.taxRate / 100);
        const total = taxableAmount + taxAmount;
        
        // Update display
        document.getElementById(`${rowId}-subtotal`).textContent = 
            this.currency + subtotal.toFixed(2);
        document.getElementById(`${rowId}-tax`).textContent = 
            this.currency + taxAmount.toFixed(2);
        document.getElementById(`${rowId}-total`).textContent = 
            this.currency + total.toFixed(2);
        
        this.calculateTotals();
    }

    calculateTotals() {
        let subtotal = 0;
        let taxTotal = 0;
        let discountTotal = 0;
        
        this.items.forEach(row => {
            const rowSubtotal = row.quantity * row.unitPrice;
            const rowDiscount = rowSubtotal * (row.discount / 100);
            const rowTaxable = rowSubtotal - rowDiscount;
            const rowTax = rowTaxable * (this.taxRate / 100);
            
            subtotal += rowSubtotal;
            discountTotal += rowDiscount;
            taxTotal += rowTax;
        });
        
        const grandTotal = subtotal - discountTotal + taxTotal;
        
        // Update totals display
        document.getElementById('subtotal').textContent = this.currency + subtotal.toFixed(2);
        document.getElementById('tax-amount').textContent = this.currency + taxTotal.toFixed(2);
        document.getElementById('discount-amount').textContent = this.currency + discountTotal.toFixed(2);
        document.getElementById('grand-total').textContent = this.currency + grandTotal.toFixed(2);
        
        // Show/hide discount row
        const discountRow = document.getElementById('discount-row');
        if (discountTotal > 0) {
            discountRow.style.display = 'flex';
        } else {
            discountRow.style.display = 'none';
        }
    }

    removeRow(rowId) {
        const rowIndex = this.items.findIndex(item => item.id === rowId);
        if (rowIndex !== -1) {
            this.items.splice(rowIndex, 1);
            document.getElementById(rowId).remove();
            this.calculateTotals();
        }
    }

    toggleRowSelection(rowId, selected) {
        const row = document.getElementById(rowId);
        if (selected) {
            this.selectedRows.add(rowId);
            row.classList.add('selected');
        } else {
            this.selectedRows.delete(rowId);
            row.classList.remove('selected');
        }
        
        // Update select all checkbox
        const selectAll = document.getElementById('select-all');
        const totalRows = this.items.length;
        const selectedCount = this.selectedRows.size;
        
        selectAll.checked = selectedCount === totalRows;
        selectAll.indeterminate = selectedCount > 0 && selectedCount < totalRows;
    }

    selectAllRows(selected) {
        const checkboxes = document.querySelectorAll('.row-select');
        checkboxes.forEach(checkbox => {
            checkbox.checked = selected;
            this.toggleRowSelection(checkbox.dataset.rowId, selected);
        });
    }

    filterTable(searchTerm) {
        const rows = document.querySelectorAll('#table-body tr');
        const term = searchTerm.toLowerCase();
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(term)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    sortTable(columnIndex) {
        const table = document.getElementById('billing-table');
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        // Determine sort direction
        const isAscending = this.sortDirection[columnIndex] !== 'asc';
        this.sortDirection[columnIndex] = isAscending ? 'asc' : 'desc';
        
        // Update sort indicators
        this.updateSortIndicators(columnIndex, isAscending);
        
        // Sort rows
        rows.sort((a, b) => {
            const aText = a.cells[columnIndex].textContent.trim();
            const bText = b.cells[columnIndex].textContent.trim();
            
            // Try to parse as numbers if possible
            const aNum = parseFloat(aText.replace(/[^\d.-]/g, ''));
            const bNum = parseFloat(bText.replace(/[^\d.-]/g, ''));
            
            if (!isNaN(aNum) && !isNaN(bNum)) {
                return isAscending ? aNum - bNum : bNum - aNum;
            }
            
            return isAscending ? 
                aText.localeCompare(bText) : 
                bText.localeCompare(aText);
        });
        
        // Re-append sorted rows
        rows.forEach(row => tbody.appendChild(row));
    }

    updateSortIndicators(activeColumn, isAscending) {
        // Clear all sort indicators
        document.querySelectorAll('.sort-indicator').forEach(indicator => {
            indicator.textContent = '↕';
        });
        
        // Set active indicator
        const activeHeader = document.querySelectorAll('th')[activeColumn];
        const indicator = activeHeader.querySelector('.sort-indicator');
        indicator.textContent = isAscending ? '↑' : '↓';
    }

    saveInvoice() {
        const invoiceData = {
            invoiceNumber: document.getElementById('invoice-number').textContent,
            date: document.getElementById('invoice-date').textContent,
            dueDate: document.getElementById('due-date').value,
            client: {
                name: document.getElementById('client-name').value,
                address: document.getElementById('client-address').value,
                email: document.getElementById('client-email').value
            },
            company: {
                name: document.getElementById('company-name').value,
                address: document.getElementById('company-address').value,
                email: document.getElementById('company-email').value
            },
            items: this.items,
            taxRate: this.taxRate,
            totals: {
                subtotal: document.getElementById('subtotal').textContent,
                tax: document.getElementById('tax-amount').textContent,
                discount: document.getElementById('discount-amount').textContent,
                grandTotal: document.getElementById('grand-total').textContent
            },
            notes: document.getElementById('notes').value,
            timestamp: new Date().toISOString()
        };
        
        // Save to localStorage
        const savedInvoices = JSON.parse(localStorage.getItem('billing-invoices') || '[]');
        savedInvoices.push(invoiceData);
        localStorage.setItem('billing-invoices', JSON.stringify(savedInvoices));
        
        this.showNotification('Invoice saved successfully!', 'success');
    }

    printInvoice() {
        window.print();
    }

    exportPDF() {
        // This would typically integrate with a PDF library
        // For now, we'll show a notification
        this.showNotification('PDF export feature would integrate with a PDF library like jsPDF', 'info');
    }

    clearAll() {
        if (confirm('Are you sure you want to clear all data?')) {
            this.items = [];
            this.selectedRows.clear();
            document.getElementById('table-body').innerHTML = '';
            document.getElementById('search').value = '';
            document.getElementById('tax-rate').value = 10;
            this.taxRate = 10;
            
            // Clear form fields
            document.getElementById('client-name').value = '';
            document.getElementById('client-address').value = '';
            document.getElementById('client-email').value = '';
            document.getElementById('company-name').value = '';
            document.getElementById('company-address').value = '';
            document.getElementById('company-email').value = '';
            document.getElementById('notes').value = '';
            
            this.calculateTotals();
            this.addInitialRow();
            
            this.showNotification('All data cleared!', 'success');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8',
            warning: '#ffc107'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    handleKeyboard(e) {
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.saveInvoice();
        }
        
        // Ctrl/Cmd + P to print
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            this.printInvoice();
        }
        
        // Delete to remove selected rows
        if (e.key === 'Delete' && this.selectedRows.size > 0) {
            if (confirm(`Delete ${this.selectedRows.size} selected row(s)?`)) {
                this.selectedRows.forEach(rowId => this.removeRow(rowId));
                this.selectedRows.clear();
            }
        }
        
        // Ctrl/Cmd + N to add new row
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.addRow();
        }
    }
}

// Initialize the billing table when the page loads
let billing;
document.addEventListener('DOMContentLoaded', function() {
    billing = new BillingTable();
});

// Additional utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Export functionality for invoices
function exportInvoiceData() {
    if (billing && billing.items.length > 0) {
        const data = {
            items: billing.items,
            totals: {
                subtotal: document.getElementById('subtotal').textContent,
                tax: document.getElementById('tax-amount').textContent,
                grandTotal: document.getElementById('grand-total').textContent
            }
        };
        downloadJSON(data, 'invoice-data.json');
    }
}

// Add some sample data for demonstration
function loadSampleData() {
    const sampleItems = [
        { item: 'Web Design', description: 'Professional website design', quantity: 1, unitPrice: 1500, discount: 0 },
        { item: 'Hosting', description: 'Annual hosting service', quantity: 1, unitPrice: 200, discount: 0 },
        { item: 'SEO', description: 'Search engine optimization', quantity: 3, unitPrice: 300, discount: 10 }
    ];
    
    sampleItems.forEach(item => billing.addRow(item));
}

// Make functions globally available
window.billing = null;
window.formatCurrency = formatCurrency;
window.downloadJSON = downloadJSON;
window.exportInvoiceData = exportInvoiceData;
window.loadSampleData = loadSampleData;