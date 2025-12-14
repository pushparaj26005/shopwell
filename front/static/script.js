// Global logout handler
function handleLogout(event) {
    event.preventDefault();
    if (confirm('Are you sure you want to logout? All your expense data will be cleared.')) {
        localStorage.clear();
        window.location.reload();
    }
}

class ExpenseTracker {
    constructor() {
        this.expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        this.currentFilter = '';
        this.currentSearch = '';
        this.init();
    }

    init() {
        this.bindEvents();
        this.setCurrentDate();
        this.render();
    }

    bindEvents() {
        document.getElementById('expenseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense();
        });

        document.getElementById('searchFilter').addEventListener('input', (e) => {
            this.currentSearch = e.target.value.toLowerCase();
            this.render();
        });

        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.render();
        });

        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.category;
                this.render();
            });
        });
    }

    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }

    addExpense() {
        const formData = new FormData(document.getElementById('expenseForm'));
        const expense = {
            id: Date.now(),
            amount: parseFloat(formData.get('amount')) || parseFloat(document.getElementById('amount').value),
            category: document.getElementById('category').value,
            description: document.getElementById('description').value.trim(),
            date: document.getElementById('date').value,
            timestamp: new Date().toISOString()
        };

        if (expense.amount && expense.category && expense.description && expense.date) {
            this.expenses.unshift(expense);
            this.saveExpenses();
            this.render();
            this.clearForm();
            
            // Show success message
            this.showNotification('Expense added successfully!', 'success');
        }
    }

    deleteExpense(id) {
        if (confirm('Are you sure you want to delete this expense?')) {
            this.expenses = this.expenses.filter(expense => expense.id !== id);
            this.saveExpenses();
            this.render();
            this.showNotification('Expense deleted successfully!', 'info');
        }
    }

    editExpense(id) {
        const expense = this.expenses.find(exp => exp.id === id);
        if (expense) {
            // Populate form with expense data
            document.getElementById('amount').value = expense.amount;
            document.getElementById('category').value = expense.category;
            document.getElementById('description').value = expense.description;
            document.getElementById('date').value = expense.date;
            
            // Change submit button to update
            const submitBtn = document.querySelector('.btn');
            submitBtn.textContent = 'Update Expense';
            submitBtn.onclick = () => this.updateExpense(id);
            
            // Show notification
            this.showNotification('Editing expense. Make changes and click Update.', 'info');
        }
    }

    updateExpense(id) {
        const formData = new FormData(document.getElementById('expenseForm'));
        const expenseIndex = this.expenses.findIndex(exp => exp.id === id);
        
        if (expenseIndex !== -1) {
            this.expenses[expenseIndex] = {
                ...this.expenses[expenseIndex],
                amount: parseFloat(formData.get('amount')) || parseFloat(document.getElementById('amount').value),
                category: document.getElementById('category').value,
                description: document.getElementById('description').value.trim(),
                date: document.getElementById('date').value
            };
            
            this.saveExpenses();
            this.render();
            this.clearForm();
            this.showNotification('Expense updated successfully!', 'success');
        }
    }

    clearForm() {
        document.getElementById('expenseForm').reset();
        this.setCurrentDate();
        
        // Reset submit button
        const submitBtn = document.querySelector('.btn');
        submitBtn.textContent = 'Add Expense';
        submitBtn.onclick = null;
        submitBtn.onclick = (e) => {
            e.preventDefault();
            this.addExpense();
        };
    }

    filterExpenses() {
        let filtered = [...this.expenses];

        // Apply category filter
        if (this.currentFilter) {
            filtered = filtered.filter(expense => expense.category === this.currentFilter);
        }

        // Apply search filter
        if (this.currentSearch) {
            filtered = filtered.filter(expense => 
                expense.description.toLowerCase().includes(this.currentSearch)
            );
        }

        return filtered;
    }

    calculateStats(expenses) {
        const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const count = expenses.length;
        const average = count > 0 ? total / count : 0;
        const highest = expenses.length > 0 ? Math.max(...expenses.map(exp => exp.amount)) : 0;

        return { total, count, average, highest };
    }

    updateStats() {
        const expenses = this.filterExpenses();
        const stats = this.calculateStats(expenses);
        
        document.getElementById('totalAmount').textContent = stats.total.toFixed(2);
        document.getElementById('totalExpenses').textContent = stats.count;
        document.getElementById('averageExpense').textContent = `$${stats.average.toFixed(2)}`;
        document.getElementById('highestExpense').textContent = `$${stats.highest.toFixed(2)}`;
    }

    render() {
        this.updateStats();
        const expenses = this.filterExpenses();
        const container = document.getElementById('expensesList');

        if (expenses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div style="font-size: 48px; margin-bottom: 20px;">📊</div>
                    <h3>${this.expenses.length === 0 ? 'No expenses yet' : 'No expenses match your filters'}</h3>
                    <p>${this.expenses.length === 0 ? 'Start tracking your spending by adding your first expense!' : 'Try adjusting your search or filter criteria.'}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = expenses.map(expense => `
            <div class="expense-item">
                <div class="expense-details">
                    <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
                    <div class="expense-category">${expense.category}</div>
                    <div class="expense-description">${expense.description}</div>
                    <div class="expense-date">${new Date(expense.date).toLocaleDateString()}</div>
                </div>
                <div class="expense-actions">
                    <button class="btn btn-small" onclick="tracker.editExpense(${expense.id})">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="tracker.deleteExpense(${expense.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    saveExpenses() {
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    exportData() {
        const data = JSON.stringify(this.expenses, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expenses-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedExpenses = JSON.parse(e.target.result);
                if (Array.isArray(importedExpenses)) {
                    this.expenses = [...importedExpenses, ...this.expenses];
                    this.saveExpenses();
                    this.render();
                    this.showNotification('Data imported successfully!', 'success');
                }
            } catch (error) {
                this.showNotification('Error importing data. Please check the file format.', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Additional utility methods
    getExpensesByDateRange(startDate, endDate) {
        return this.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
        });
    }

    getExpensesByCategory() {
        const categoryTotals = {};
        this.expenses.forEach(expense => {
            if (categoryTotals[expense.category]) {
                categoryTotals[expense.category] += expense.amount;
            } else {
                categoryTotals[expense.category] = expense.amount;
            }
        });
        return categoryTotals;
    }

    getMonthlyExpenses(year) {
        const monthlyTotals = Array(12).fill(0);
        this.expenses.forEach(expense => {
            const expenseDate = new Date(expense.date);
            if (expenseDate.getFullYear() === year) {
                monthlyTotals[expenseDate.getMonth()] += expense.amount;
            }
        });
        return monthlyTotals;
    }

    clearAllExpenses() {
        if (confirm('Are you sure you want to delete ALL expenses? This action cannot be undone.')) {
            this.expenses = [];
            this.saveExpenses();
            this.render();
            this.showNotification('All expenses have been cleared.', 'info');
        }
    }
}

// Initialize the expense tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.tracker = new ExpenseTracker();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 's':
                    e.preventDefault();
                    tracker.exportData();
                    break;
                case 'o':
                    e.preventDefault();
                    document.getElementById('importFile').click();
                    break;
                case 'n':
                    e.preventDefault();
                    document.getElementById('amount').focus();
                    break;
                case 'l':
                    e.preventDefault();
                    handleLogout(e);
                    break;
            }
        }
    });
});

// Export for global access
window.ExpenseTracker = ExpenseTracker;