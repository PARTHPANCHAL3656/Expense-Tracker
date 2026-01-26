// Store chart instances globally so we can update them
let categoryPieChart = null;
let dailyBarChart = null;

// When page loads, initialize everything
document.addEventListener("DOMContentLoaded", function () {
  console.log("📊 Dashboard loading...");

  // Update all dashboard elements
  updateDashboard();

  console.log("✅ Dashboard loaded successfully!");
});

// Main function to update entire dashboard
function updateDashboard() {
  updateMonthHeader();
  updateTotalSpent();
  updateTransactionCount();
  updateTopCategories();
  createPieChart();
  createBarChart();
}

// Function 1: Update month header (January 2026 Overview)
function updateMonthHeader() {
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

  const now = new Date();
  const monthName = monthNames[now.getMonth()];
  const year = now.getFullYear();

  const headerH3 = document.querySelector(".header-section h3");
  if (headerH3) {
    headerH3.textContent = `${monthName} ${year} Overview`;
  }
}

// Function 2: Update total spent this month
function updateTotalSpent() {
  const expenses = getCurrentMonthExpenses();

  // Calculate total
  let total = 0;
  expenses.forEach(function (expense) {
    total += expense.amount;
  });

  // Update display
  const totalElement = document.getElementById("total-spent");
  if (totalElement) {
    totalElement.textContent = "₹" + total.toLocaleString("en-IN");
  }

  console.log("💰 Total spent this month: ₹" + total);
}

// Function 3: Update transaction count
function updateTransactionCount() {
  const expenses = getCurrentMonthExpenses();
  const count = expenses.length;

  // Update the count (it's inside a span)
  const countContainer = document.getElementById("transaction-count");
  if (countContainer) {
    const span = countContainer.querySelector("span");
    if (span) {
      span.textContent = count;
    }
  }

  console.log("📝 Transaction count: " + count);
}

// Function 4: Update top spending categories
function updateTopCategories() {
  const expenses = getCurrentMonthExpenses();

  // Calculate total spent per category
  const categoryTotals = {};

  expenses.forEach(function (expense) {
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

  // Convert to array and sort by total (highest first)
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

  // Get top 3
  const top3 = sortedCategories.slice(0, 3);

  // Calculate grand total for percentages
  let grandTotal = 0;
  expenses.forEach(function (expense) {
    grandTotal += expense.amount;
  });

  // Get the container
  const container = document.getElementById("top-categories-list");
  if (!container) return;

  // If no expenses, show message
  if (top3.length === 0) {
    container.innerHTML = `
      <h3 class="section-title">Top Spending Categories</h3>
      <p style="text-align: center; color: #999; padding: 40px 20px;">
        No expenses this month yet.<br>Start adding expenses to see your top categories!
      </p>
    `;
    return;
  }

  // Build HTML for top 3 categories
  let html = '<h3 class="section-title">Top Spending Categories</h3>';

  top3.forEach(function (cat) {
    const percentage =
      grandTotal > 0 ? Math.round((cat.total / grandTotal) * 100) : 0;

    html += `
      <div class="category-item">
        <div class="category-header">
          <span class="category-icon">${cat.icon}</span>
          <span class="category-name">${cat.name}</span>
          <span class="category-amount">₹${cat.total.toLocaleString("en-IN")}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${percentage}%"></div>
        </div>
        <p class="category-percent">${percentage}% of total</p>
      </div>
    `;
  });

  container.innerHTML = html;

  console.log("📊 Top categories updated");
}

// Function 5: Create pie chart for category breakdown
function createPieChart() {
  const canvas = document.getElementById("category-chart");
  if (!canvas) {
    console.error("❌ Pie chart canvas not found");
    return;
  }

  const ctx = canvas.getContext("2d");
  const expenses = getCurrentMonthExpenses();

  // Destroy existing chart if it exists
  if (categoryPieChart) {
    categoryPieChart.destroy();
  }

  // Calculate category totals
  const categoryTotals = {};

  expenses.forEach(function (expense) {
    const catName = expense.categoryName;

    if (!categoryTotals[catName]) {
      categoryTotals[catName] = 0;
    }

    categoryTotals[catName] += expense.amount;
  });

  // Prepare data for chart
  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  // If no data, show message
  if (labels.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "14px Arial";
    ctx.fillStyle = "#999";
    ctx.textAlign = "center";
    ctx.fillText("No expenses to display", canvas.width / 2, canvas.height / 2);
    return;
  }

  // Color palette (vibrant colors)
  const colors = [
    "#6366f1", // Indigo
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#f59e0b", // Amber
    "#10b981", // Emerald
    "#3b82f6", // Blue
    "#ef4444", // Red
    "#14b8a6", // Teal
    "#f97316", // Orange
    "#8b5cf6", // Purple
  ];

  // Create the pie chart
  categoryPieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors,
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 15,
            font: {
              size: 12,
            },
            usePointStyle: true,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.parsed || 0;

              // Calculate percentage
              let sum = 0;
              context.dataset.data.forEach(function (val) {
                sum += val;
              });

              const percentage = ((value / sum) * 100).toFixed(1);

              return `${label}: ₹${value.toLocaleString("en-IN")} (${percentage}%)`;
            },
          },
        },
      },
    },
  });

  console.log("🥧 Pie chart created with", labels.length, "categories");
}

// Function 6: Create bar chart for last 7 days
function createBarChart() {
  const canvas = document.getElementById("daily-chart");
  if (!canvas) {
    console.error("❌ Bar chart canvas not found");
    return;
  }

  const ctx = canvas.getContext("2d");
  const allExpenses = getExpensesFromStorage();

  // Destroy existing chart if it exists
  if (dailyBarChart) {
    dailyBarChart.destroy();
  }

  // Get last 7 days
  const last7Days = [];
  const dailyTotals = {};
  const dayLabels = [];

  // Get current day of week (0 = Sunday, 1 = Monday, etc.)
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0-6

  // Calculate days to go back to Monday
  const daysToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

  // Start from Monday and go through Sunday
  for (let i = daysToMonday; i >= daysToMonday - 6; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    last7Days.push(dateString);
    dailyTotals[dateString] = 0;

    // Get day name (Mon, Tue, etc.)
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    dayLabels.push(dayName);
  }

  // Calculate daily totals
  allExpenses.forEach(function (expense) {
    if (dailyTotals.hasOwnProperty(expense.date)) {
      dailyTotals[expense.date] += expense.amount;
    }
  });

  // Prepare data array
  const data = last7Days.map(function (date) {
    return dailyTotals[date];
  });

  // Create the bar chart
  dailyBarChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: dayLabels,
      datasets: [
        {
          label: "Daily Spending",
          data: data,
          backgroundColor: "rgba(99, 102, 241, 0.8)",
          borderColor: "#6366f1",
          borderWidth: 1,
          borderRadius: 6,
          barThickness: 40,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "₹" + value.toLocaleString("en-IN");
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return "₹" + context.parsed.y.toLocaleString("en-IN");
            },
          },
        },
      },
    },
  });

  console.log("📊 Bar chart created for last 7 days");
}

// Helper function: Get current month's expenses
function getCurrentMonthExpenses() {
  const allExpenses = getExpensesFromStorage();

  // Get current month in YYYY-MM format
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Filter expenses for current month
  const monthExpenses = allExpenses.filter(function (expense) {
    return expense.month === currentMonth;
  });

  return monthExpenses;
}

// Helper function: Get all expenses from localStorage
function getExpensesFromStorage() {
  const stored = localStorage.getItem("expenses");

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error("❌ Error reading expenses:", error);
      return [];
    }
  }

  return [];
}

// Function to manually refresh dashboard (for testing)
function refreshDashboard() {
  console.log("🔄 Refreshing dashboard...");
  updateDashboard();
}

// Auto-refresh when page becomes visible (if user switches tabs)
document.addEventListener("visibilitychange", function () {
  if (!document.hidden) {
    console.log("👀 Page visible, refreshing...");
    updateDashboard();
  }
});

// Make refresh function available in console
window.refreshDashboard = refreshDashboard;

console.log("💡 Debug command: refreshDashboard() - Manually refresh all data");
