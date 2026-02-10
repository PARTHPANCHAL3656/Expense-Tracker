// Category configuration matching YOUR HTML categories
const CATEGORIES = {
  Groceries: {
    name: "Groceries",
    icon: "/icons/svg/shopping-cart.svg",
  },

  Utilities: {
    name: "Utilities",
    icon: "/icons/svg/zap.svg",
  },

  Housing: {
    name: "Housing",
    icon: "/icons/svg/home.svg",
  },

  Education: {
    name: "Education",
    icon: "/icons/svg/graduation-cap.svg",
  },

  Healthcare: {
    name: "Healthcare",
    icon: "/icons/svg/pill.svg",
  },

  Transportation: {
    name: "Transportation",
    icon: "/icons/svg/car.svg",
  },

  Clothing: {
    name: "Clothing",
    icon: "/icons/svg/shirt.svg",
  },

  Entertainment: {
    name: "Entertainment",
    icon: "/icons/svg/clapperboard.svg",
  },

  Subscriptions: {
    name: "Subscriptions",
    icon: "/icons/svg/calendar-days.svg",
  },

  Services: {
    name: "Services",
    icon: "/icons/svg/user-round-pen.svg",
  },
};

// Track which category is selected
let selectedCategory = null;

// Wait for page to fully load before running code
document.addEventListener("DOMContentLoaded", function () {
  console.log("Page loaded, initializing...");

  // Setup all functionality
  setTodayDate();
  setupCategoryButtons();
  setupSaveButton();
  updateTodayTotal();
});

// Function 1: Set today's date automatically
function setTodayDate() {
  const dateInput = document.getElementById("expense-date");

  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, "0");

  const todayString = `${year}-${month}-${day}`;
  dateInput.value = todayString;

  console.log("Date set to:", todayString);
}

// Function 2: Setup category button clicks
function setupCategoryButtons() {
  // Get all category buttons
  const categoryButtons = document.querySelectorAll(".gridButton");
  console.log(`Found ${categoryButtons.length} category buttons`);

  // Add click event to each button
  categoryButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      // Remove 'active' class from all buttons
      categoryButtons.forEach(function (btn) {
        btn.classList.remove("active");
      });

      // Add 'active' class to clicked button
      button.classList.add("active");

      // Save which category was selected
      selectedCategory = button.getAttribute("data-category");
      console.log("Selected category:", selectedCategory);
    });
  });
}

// Function 3: Setup save button click
function setupSaveButton() {
  const saveButton = document.querySelector(".save-button");

  saveButton.addEventListener("click", function () {
    console.log("Save button clicked");

    // Check if form is valid
    if (validateForm()) {
      // Save the expense
      saveExpense();
    }
  });
}

// Function 4: Validate form before saving
function validateForm() {
  // Get the amount input
  const amountInput = document.getElementById("expense-amount");
  const amount = amountInput.value.trim();

  // Check 1: Is amount entered?
  if (amount === "" || amount === "0" || parseFloat(amount) <= 0) {
    showMessage("Please enter a valid amount", "error");
    amountInput.focus();
    return false;
  }

  // Check 2: Is category selected?
  if (!selectedCategory) {
    showMessage("Please select a category", "error");
    return false;
  }

  console.log("Form validation passed");
  return true;
}

// Function 5: Save expense to localStorage
function saveExpense() {
  // Get all form values
  const date = document.getElementById("expense-date").value;
  const amount = Math.round(
    parseFloat(document.getElementById("expense-amount").value),
  ); // Whole number
  const description = document
    .getElementById("expense-description")
    .value.trim();
  const paymentMethod = document.getElementById("payment-method").value;

  // Convert payment method value to display name
  const paymentDisplay = {
    cash: "Cash",
    card: "Card",
    "online-payment": "Online Payment",
    "bank-transfer": "Bank Transfer",
    other: "Other",
  };

  // Create expense object
  const expense = {
    id: generateUniqueId(),
    date: date,
    amount: amount,
    category: selectedCategory,
    categoryName: CATEGORIES[selectedCategory].name,
    categoryIcon: CATEGORIES[selectedCategory].icon,
    paymentMethod: paymentDisplay[paymentMethod] || paymentMethod,
    description: description,
    month: date.substring(0, 7), // "2026-01"
    editable: true,
  };

  console.log("Created expense:", expense);

  // Get existing expenses from localStorage
  let expenses = getExpensesFromStorage();

  // Add new expense to array
  expenses.push(expense);

  // Save back to localStorage
  localStorage.setItem("expenses", JSON.stringify(expenses));
  console.log("Saved to localStorage. Total expenses:", expenses.length);

  // Show success message
  showMessage("Expense saved successfully!", "success");

  // Clear the form
  clearForm();

  // Update today's total
  updateTodayTotal();
}

// Function 6: Generate unique ID
function generateUniqueId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `exp_${timestamp}_${random}`;
}

// Function 7: Get expenses from localStorage
function getExpensesFromStorage() {
  const stored = localStorage.getItem("expenses");

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error("Error reading localStorage:", error);
      return [];
    }
  }

  return [];
}

// Function 8: Clear form after saving
function clearForm() {
  // Clear amount
  document.getElementById("expense-amount").value = "";

  // Clear description
  document.getElementById("expense-description").value = "";

  // Reset payment to first option (Cash)
  document.getElementById("payment-method").selectedIndex = 0;

  // Remove active class from all category buttons
  document.querySelectorAll(".gridButton").forEach(function (btn) {
    btn.classList.remove("active");
  });

  // Clear selected category
  selectedCategory = null;

  // Reset date to today
  setTodayDate();

  console.log("Form cleared");
}

// Function 9: Update today's total display
function updateTodayTotal() {
  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Get all expenses
  const expenses = getExpensesFromStorage();

  // Filter today's expenses and calculate total
  let todayTotal = 0;
  expenses.forEach(function (expense) {
    if (expense.date === todayString) {
      todayTotal += expense.amount;
    }
  });

  // Update the display
  const todayTotalElement = document.getElementById("today-total");
  todayTotalElement.textContent = "₹" + todayTotal.toLocaleString("en-IN");

  console.log("Today's total: ₹" + todayTotal);
}

// Function 10: Show message (success or error)
function showMessage(text, type) {
  // Remove any existing message
  const existingMessage = document.getElementById("notification-message");
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create message element
  const message = document.createElement("div");
  message.id = "notification-message";
  message.textContent = text;

  // Style based on type
  if (type === "success") {
    message.style.backgroundColor = "#10b981";
    message.style.color = "white";
  } else if (type === "error") {
    message.style.backgroundColor = "#ef4444";
    message.style.color = "white";
  }

  // Common styles
  message.style.position = "fixed";
  message.style.top = "20px";
  message.style.left = "50%";
  message.style.transform = "translateX(-50%)";
  message.style.padding = "12px 24px";
  message.style.borderRadius = "8px";
  message.style.fontSize = "14px";
  message.style.fontWeight = "500";
  message.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  message.style.zIndex = "9999";
  message.style.transition = "all 0.3s";

  // Add to page
  document.body.appendChild(message);

  // Animate in
  setTimeout(function () {
    message.style.opacity = "1";
  }, 10);

  // Remove after 3 seconds
  setTimeout(function () {
    message.style.opacity = "0";
    setTimeout(function () {
      message.remove();
    }, 300);
  }, 3000);
}

// ==========================================
// TESTING HELPER FUNCTIONS (Optional)
// ==========================================

// Function to view all expenses (for debugging)
function viewAllExpenses() {
  const expenses = getExpensesFromStorage();
  console.log("All expenses:", expenses);
  console.table(expenses);
  return expenses;
}

// Function to clear all expenses (for testing)
function clearAllExpenses() {
  if (
    confirm(
      "Are you sure you want to delete ALL expenses? This cannot be undone!",
    )
  ) {
    localStorage.removeItem("expenses");
    updateTodayTotal();
    console.log("All expenses cleared");
    showMessage("All expenses deleted", "success");
  }
}

// Make functions available in console for debugging
window.viewAllExpenses = viewAllExpenses;
window.clearAllExpenses = clearAllExpenses;

console.log("home.js loaded successfully!");
console.log("Debug commands:");
console.log("   - viewAllExpenses() → View all saved expenses");
console.log("   - clearAllExpenses() → Delete all expenses");
