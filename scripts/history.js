// Track current filter (empty = show all)
let currentFilter = '';

// When page loads, initialize everything
document.addEventListener("DOMContentLoaded", function () {
  console.log("History page loading...");

  setupFilterDropdown();
  renderExpenseList();

  console.log("History page loaded successfully!");
});

// Function 1: Setup filter dropdown
function setupFilterDropdown() {
  const filterSelect = document.getElementById("category-filter");

  if (!filterSelect) {
    console.error("Filter dropdown not found");
    return;
  }

  filterSelect.addEventListener("change", function (e) {
    currentFilter = e.target.value;
    console.log("Filter changed to:", currentFilter);
    renderExpenseList();
  });
}

// Function 2: Render expense list
function renderExpenseList() {
  const container = document.getElementById("expense-list");

  if (!container) {
    console.error("Expense list container not found");
    return;
  }

  // Get all expenses
  let expenses = getExpensesFromStorage();

  // Apply filter (no filtering if no valid category selected)
  if (currentFilter && currentFilter !== "all") {
    expenses = expenses.filter(function (expense) {
      return expense.category === currentFilter;
    });
  }

  // Sort by ID (latest added first) - most recent expense shows at top
  expenses.sort(function (a, b) {
    // Extract timestamp from ID (format: exp_1234567890_abc123)
    const timeA = parseInt(a.id.split("_")[1]);
    const timeB = parseInt(b.id.split("_")[1]);
    return timeB - timeA; // Newest first
  });

  // If no expenses
  if (expenses.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: #999;">
        <p style="font-size: 48px; margin-bottom: 10px;">📭</p>
        <p style="font-size: 16px;">No expenses found</p>
        <p style="font-size: 14px; margin-top: 8px;">
          ${currentFilter !== "all" ? "Try selecting a different category" : "Start adding expenses to see them here"}
        </p>
      </div>
    `;
    return;
  }

  // Build HTML for all expenses
  let html = "";

  expenses.forEach(function (expense) {
    html += createExpenseItemHTML(expense);
  });

  container.innerHTML = html;

  // Attach event listeners to buttons
  attachEventListeners();

  console.log("Rendered", expenses.length, "expenses");
}

// Function 3: Create HTML for single expense item
function createExpenseItemHTML(expense) {
  // Format date (13 Jan 2026)
  const date = new Date(expense.date + "T00:00:00");
  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `
    <div class="expense-card" data-id="${expense.id}">
        <img src="${expense.categoryIcon}" alt="${expense.categoryName}" class="expense-icon">
      <div class="expense-details">
        <h4 class="expense-title">${expense.categoryName}</h4>
        <p class="expense-date">${formattedDate}</p>
        ${expense.description ? `<p class="expense-description">${expense.description}</p>` : ""}
        <p class="expense-payment">${expense.paymentMethod}</p>
      </div>
      <div class="expense-amount">₹${expense.amount.toLocaleString("en-IN")}</div>
      <div class="expense-actions">
        <button class="action-btn edit" data-id="${expense.id}">Edit</button>
        <button class="action-btn delete" data-id="${expense.id}">Delete</button>
      </div>
    </div>
  `;
}

// Function 4: Attach event listeners to Edit and Delete buttons
function attachEventListeners() {
  // Edit buttons
  const editButtons = document.querySelectorAll(".action-btn.edit");
  editButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const expenseId = button.getAttribute("data-id");
      openEditModal(expenseId);
    });
  });

  // Delete buttons
  const deleteButtons = document.querySelectorAll(".action-btn.delete");
  deleteButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const expenseId = button.getAttribute("data-id");
      deleteExpense(expenseId);
    });
  });
}

// Function 5: Delete expense
function deleteExpense(expenseId) {
  // Confirm deletion
  const confirmed = confirm(
    "Are you sure you want to delete this expense?\n\nThis action cannot be undone.",
  );

  if (!confirmed) {
    return;
  }

  // Get all expenses
  const expenses = getExpensesFromStorage();

  // Filter out the expense to delete
  const updatedExpenses = expenses.filter(function (expense) {
    return expense.id !== expenseId;
  });

  // Save back to localStorage
  localStorage.setItem("expenses", JSON.stringify(updatedExpenses));

  console.log("Deleted expense:", expenseId);

  // Re-render list
  renderExpenseList();

  // Show success message
  showToast("Expense deleted successfully!", "success");
}

// Function 6: Open edit modal
function openEditModal(expenseId) {
  // Get the expense
  const expenses = getExpensesFromStorage();
  const expense = expenses.find(function (exp) {
    return exp.id === expenseId;
  });

  if (!expense) {
    showToast("Expense not found", "error");
    return;
  }

  // Check if expense is editable (current month only)
  if (!expense.editable) {
    showToast("Cannot edit expenses from previous months", "error");
    return;
  }

  console.log("Opening edit modal for:", expense.categoryName);

  // Create modal HTML
  const modalHTML = `
    <div class="modal-overlay" id="edit-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Edit Expense</h2>
          <button class="modal-close" id="close-modal">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>Amount (₹)</label>
            <input type="number" id="edit-amount" value="${expense.amount}" required>
          </div>
          
          <div class="form-group">
            <label>Category</label>
            <input type="text" id="edit-category" value="${expense.categoryName}" readonly>
          </div>
          
          <div class="form-group">
            <label>Date</label>
            <input type="date" id="edit-date" value="${expense.date}" required>
          </div>
          
          <div class="form-group">
            <label>Payment Method</label>
            <select id="edit-payment">
              <option value="Cash" ${expense.paymentMethod === "Cash" ? "selected" : ""}>Cash</option>
              <option value="Card" ${expense.paymentMethod === "Card" ? "selected" : ""}>Card</option>
              <option value="Online Payment" ${expense.paymentMethod === "Online Payment" ? "selected" : ""}>Online Payment</option>
              <option value="Bank Transfer" ${expense.paymentMethod === "Bank Transfer" ? "selected" : ""}>Bank Transfer</option>
              <option value="Other" ${expense.paymentMethod === "Other" ? "selected" : ""}>Other</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Description</label>
            <textarea id="edit-description" rows="3">${expense.description || ""}</textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="modal-btn cancel" id="cancel-edit">Cancel</button>
          <button class="modal-btn save" id="save-edit">Save Changes</button>
        </div>
      </div>
    </div>
  `;

  // Add modal to page
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Add modal styles
  addModalStyles();

  // Setup modal event listeners
  setupModalEvents(expenseId);
}

// Function 7: Add modal styles
function addModalStyles() {
  // Check if styles already exist
  if (document.getElementById("modal-styles")) {
    return;
  }

  const styles = document.createElement("style");
  styles.id = "modal-styles";
  styles.textContent = `
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 20px;
      animation: fadeIn 0.2s;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .modal-content {
      background: white;
      border-radius: 16px;
      max-width: 500px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      animation: slideUp 0.3s;
    }
    
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .modal-header h2 {
      margin: 0;
      font-size: 20px;
      color: #111;
    }
    
    .modal-close {
      background: none;
      border: none;
      font-size: 32px;
      color: #999;
      cursor: pointer;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      transition: all 0.2s;
    }
    
    .modal-close:hover {
      background: #f3f4f6;
      color: #333;
    }
    
    .modal-body {
      padding: 20px;
    }
    
    .form-group {
      margin-bottom: 16px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      font-size: 14px;
      color: #374151;
    }
    
    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.2s;
    }
    
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #6366f1;
    }
    
    .form-group input[readonly] {
      background: #f3f4f6;
      color: #6b7280;
      cursor: not-allowed;
    }
    
    .modal-footer {
      display: flex;
      gap: 12px;
      padding: 20px;
      border-top: 1px solid #e5e7eb;
    }
    
    .modal-btn {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .modal-btn.cancel {
      background: #f3f4f6;
      color: #374151;
    }
    
    .modal-btn.cancel:hover {
      background: #e5e7eb;
    }
    
    .modal-btn.save {
      background: #6366f1;
      color: white;
    }
    
    .modal-btn.save:hover {
      background: #4f46e5;
    }
  `;

  document.head.appendChild(styles);
}

// Function 8: Setup modal event listeners
function setupModalEvents(expenseId) {
  const modal = document.getElementById("edit-modal");
  const closeBtn = document.getElementById("close-modal");
  const cancelBtn = document.getElementById("cancel-edit");
  const saveBtn = document.getElementById("save-edit");

  // Close modal function
  function closeModal() {
    modal.remove();
  }

  // Close button
  closeBtn.addEventListener("click", closeModal);

  // Cancel button
  cancelBtn.addEventListener("click", closeModal);

  // Click outside modal
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Save button
  saveBtn.addEventListener("click", function () {
    saveEditedExpense(expenseId);
    closeModal();
  });
}

// Function 9: Save edited expense
function saveEditedExpense(expenseId) {
  // Get updated values
  const amount = parseInt(document.getElementById("edit-amount").value);
  const date = document.getElementById("edit-date").value;
  const paymentMethod = document.getElementById("edit-payment").value;
  const description = document.getElementById("edit-description").value.trim();

  // Validate
  if (!amount || amount <= 0) {
    showToast("Please enter a valid amount", "error");
    return;
  }

  if (!date) {
    showToast("Please select a date", "error");
    return;
  }

  // Get all expenses
  const expenses = getExpensesFromStorage();

  // Find and update the expense
  const expenseIndex = expenses.findIndex(function (exp) {
    return exp.id === expenseId;
  });

  if (expenseIndex === -1) {
    showToast("Expense not found", "error");
    return;
  }

  // Update the expense
  expenses[expenseIndex].amount = amount;
  expenses[expenseIndex].date = date;
  expenses[expenseIndex].month = date.substring(0, 7);
  expenses[expenseIndex].paymentMethod = paymentMethod;
  expenses[expenseIndex].description = description;

  // Save to localStorage
  localStorage.setItem("expenses", JSON.stringify(expenses));

  console.log("Updated expense:", expenseId);

  // Re-render list
  renderExpenseList();

  // Show success message
  showToast("Expense updated successfully!", "success");
}

// Function 10: Show toast notification
function showToast(message, type) {
  // Remove existing toast
  const existing = document.getElementById("toast-notification");
  if (existing) {
    existing.remove();
  }

  // Create toast
  const toast = document.createElement("div");
  toast.id = "toast-notification";
  toast.textContent = message;

  // Style based on type
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === "success" ? "#10b981" : "#ef4444"};
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideDown 0.3s;
  `;

  // Add animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideDown {
      from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
      to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  // Add to page
  document.body.appendChild(toast);

  // Remove after 3 seconds
  setTimeout(function () {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(-20px)";
    setTimeout(function () {
      toast.remove();
    }, 300);
  }, 3000);
}

// Helper function: Get expenses from localStorage
function getExpensesFromStorage() {
  const stored = localStorage.getItem("expenses");

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error("Error reading expenses:", error);
      return [];
    }
  }

  return [];
}

// Function to manually refresh list (for testing)
function refreshHistory() {
  console.log("Refreshing history...");
  renderExpenseList();
}

// Auto-refresh when page becomes visible
document.addEventListener("visibilitychange", function () {
  if (!document.hidden) {
    console.log("Page visible, refreshing...");
    renderExpenseList();
  }
});

// Make refresh function available in console
window.refreshHistory = refreshHistory;

console.log(
  "💡 Debug command: refreshHistory() - Manually refresh expense list",
);

// ==========================================
// PAST MONTH FEATURE
// ==========================================

// Track if we're viewing past month
let viewingPastMonth = false;
let currentViewMonth = null;

// Initialize past month feature when page loads
document.addEventListener("DOMContentLoaded", function () {
  // ... your existing code ...

  // Add this after your existing initialization
  setupPastMonthFeature();
});

// Setup past month button and dropdown
function setupPastMonthFeature() {
  const pastMonthBtn = document.getElementById("past-month-btn");
  const monthDropdown = document.getElementById("month-dropdown");
  const closeDropdown = document.getElementById("close-dropdown");
  const backBtn = document.getElementById("back-to-current");

  // Show dropdown when button clicked
  pastMonthBtn.addEventListener("click", function () {
    populateMonthDropdown();
    monthDropdown.style.display = "block";
  });

  // Close dropdown
  closeDropdown.addEventListener("click", function () {
    monthDropdown.style.display = "none";
  });

  // Back to current expenses
  backBtn.addEventListener("click", function () {
    viewingPastMonth = false;
    currentViewMonth = null;
    showCurrentExpenses();
  });
}

// Get list of all past months (excluding current month)
function getPastMonths() {
  const expenses = getExpensesFromStorage();
  const monthSet = new Set();

  // Get current month
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Collect all unique months from expenses
  expenses.forEach(function (expense) {
    if (expense.month && expense.month !== currentMonth) {
      monthSet.add(expense.month);
    }
  });

  // Convert to array and sort (newest first)
  const months = Array.from(monthSet).sort().reverse();

  return months;
}

// Format month string to readable format (2026-01 → January 2026)
function formatMonthName(monthString) {
  const [year, month] = monthString.split("-");
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthIndex = parseInt(month) - 1;
  return `${monthNames[monthIndex]} ${year}`;
}

// Populate the month dropdown list
function populateMonthDropdown() {
  const monthList = document.getElementById("month-list");
  const pastMonths = getPastMonths();

  if (pastMonths.length === 0) {
    monthList.innerHTML = `
      <div class="no-past-months">
        <p>📭 No past months yet</p>
        <p style="font-size: 13px; color: #999; margin-top: 8px;">
          Past months will appear here automatically when the month changes
        </p>
      </div>
    `;
    return;
  }

  // Build month buttons
  let html = "";
  pastMonths.forEach(function (month) {
    const displayName = formatMonthName(month);
    html += `
      <button class="month-item" data-month="${month}">
        <span class="month-name">${displayName}</span>
        <span class="month-arrow">→</span>
      </button>
    `;
  });

  monthList.innerHTML = html;

  // Attach click handlers
  document.querySelectorAll(".month-item").forEach(function (button) {
    button.addEventListener("click", function () {
      const selectedMonth = button.getAttribute("data-month");
      showMonthSummary(selectedMonth);
      document.getElementById("month-dropdown").style.display = "none";
    });
  });
}

// Show summary for selected past month
function showMonthSummary(monthString) {
  viewingPastMonth = true;
  currentViewMonth = monthString;

  const expenses = getExpensesFromStorage();

  // Filter expenses for this month
  const monthExpenses = expenses.filter(function (expense) {
    return expense.month === monthString;
  });

  // Calculate total
  let total = 0;
  monthExpenses.forEach(function (expense) {
    total += expense.amount;
  });

  // Calculate category breakdown
  const categoryTotals = {};
  monthExpenses.forEach(function (expense) {
    const cat = expense.category;
    if (!categoryTotals[cat]) {
      categoryTotals[cat] = {
        name: expense.categoryName,
        icon: expense.categoryIcon,
        total: 0,
      };
    }
    categoryTotals[cat].total += expense.amount;
  });

  // Sort categories by total (highest first)
  const sortedCategories = [];
  for (let key in categoryTotals) {
    sortedCategories.push({
      category: key,
      name: categoryTotals[key].name,
      icon: categoryTotals[key].icon,
      total: categoryTotals[key].total,
    });
  }
  sortedCategories.sort(function (a, b) {
    return b.total - a.total;
  });

  // Update UI
  document.getElementById("summary-month-title").textContent =
    formatMonthName(monthString);
  document.getElementById("summary-total-amount").textContent =
    "₹" + total.toLocaleString("en-IN");

  // Build category breakdown HTML
  const categoriesContainer = document.getElementById("summary-categories");
  let html = '<h3 class="category-breakdown-title">Category Breakdown</h3>';

  if (sortedCategories.length === 0) {
    html +=
      '<p style="text-align: center; color: #999; padding: 20px;">No expenses in this month</p>';
  } else {
    sortedCategories.forEach(function (cat) {
      const percentage = total > 0 ? Math.round((cat.total / total) * 100) : 0;
      html += `
        <div class="summary-category-item">
          <div class="summary-cat-header">
            <img src="${cat.icon}" alt="${cat.name}" class="summary-cat-icon">
            <span class="summary-cat-name">${cat.name}</span>
            <span class="summary-cat-amount">₹${cat.total.toLocaleString("en-IN")}</span>
          </div>
          <div class="summary-progress-bar">
            <div class="summary-progress-fill" style="width: ${percentage}%"></div>
          </div>
          <p class="summary-cat-percent">${percentage}% of total</p>
        </div>
      `;
    });
  }

  categoriesContainer.innerHTML = html;

  // Hide current expense list, show summary
  document.getElementById("expense-list").style.display = "none";
  document.querySelector(".filter-section").style.display = "none";
  document.querySelector(".past-month-section").style.display = "none";
  document.getElementById("month-summary").style.display = "block";
}

// Show current month expenses (back button)
function showCurrentExpenses() {
  document.getElementById("expense-list").style.display = "block";
  document.querySelector(".filter-section").style.display = "block";
  document.querySelector(".past-month-section").style.display = "block";
  document.getElementById("month-summary").style.display = "none";

  // Re-render current expenses
  renderExpenseList();
}
