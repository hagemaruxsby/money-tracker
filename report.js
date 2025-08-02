import { supabase } from './supabase.js';

const transactionsBtn = document.getElementById('nav-transactions');
const monthFilter = document.getElementById('monthFilter');
const reportContainer = document.getElementById('report-container');
const reportChartCanvas = document.getElementById('reportChart');
let chartInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || !data.user.email_confirmed_at) {
    console.error("User not authenticated or email not confirmed:", error);
    window.location.href = '/index.html';
    return;
  }
  await loadReportData(data.user.id);
});

transactionsBtn.addEventListener('click', async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || !data.user.email_confirmed_at) {
    console.error("User not authenticated or email not confirmed:", error);
    window.location.href = '/index.html';
    return;
  }
  window.location.href = './transactions.html';
});

monthFilter.addEventListener('change', async () => {
  const { data } = await supabase.auth.getUser();
  if (!data.user || !data.user.email_confirmed_at) {
    console.error("User not authenticated or email not confirmed");
    window.location.href = '/index.html';
    return;
  }
  await loadReportData(data.user.id, monthFilter.value);
});

async function loadReportData(userId, selectedMonth = null) {
  const { data, error } = await supabase
    .from('transactions')
    .select('id, user_id, title, amount, type, date')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error loading transactions:', error);
    reportContainer.innerHTML = '<li class="p-2 text-red-600">Error loading report.</li>';
    return;
  }

  if (!data || data.length === 0) {
    reportContainer.innerHTML = '<li class="p-2">No transactions found.</li>';
    monthFilter.innerHTML = '<option value="">No data</option>';
    return;
  }

  const groupedByMonth = groupTransactionsByMonth(data);
  populateMonthFilter(groupedByMonth, selectedMonth);

  const months = Object.keys(groupedByMonth).sort().reverse();
  const displayMonth = selectedMonth || months[0];
  const transactions = groupedByMonth[displayMonth] || [];

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const [year, month] = displayMonth ? displayMonth.split('-') : ['', ''];
  const monthName = getMonthName(month);
  const title = `Laporan Keuangan ${monthName} ${year}`;
  reportContainer.innerHTML = `
    <li class="bg-white shadow-lg rounded-2xl p-4 border-l-4 border-blue-500">
      <h3 class="text-xl font-bold mb-2 text-blue-600">${title}</h3>
      <p class="text-green-600">Total Pemasukan: Rp${formatCurrency(totalIncome)}</p>
      <p class="text-red-600">Total Pengeluaran: Rp${formatCurrency(totalExpense)}</p>
      <p class="font-semibold mt-2">Saldo: Rp${formatCurrency(balance)}</p>
    </li>
  `;

  updateChart(totalIncome, totalExpense, monthName, year);
}

function groupTransactionsByMonth(transactions) {
  return transactions.reduce((acc, tx) => {
    const date = new Date(tx.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});
}

function populateMonthFilter(groupedByMonth, selectedMonth) {
  const months = Object.keys(groupedByMonth).sort().reverse();
  monthFilter.innerHTML = months.map(month => {
    const [year, monthNum] = month.split('-');
    const monthName = getMonthName(monthNum);
    return `<option value="${month}" ${month === selectedMonth ? 'selected' : ''}>${monthName} ${year}</option>`;
  }).join('');
}

function getMonthName(month) {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[parseInt(month, 10) - 1] || '';
}

function formatCurrency(value) {
  return value.toLocaleString('id-ID');
}

function updateChart(income, expense, monthName, year) {
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(reportChartCanvas, {
    type: 'bar',
    data: {
      labels: ['Pemasukan', 'Pengeluaran'],
      datasets: [{
        label: `Keuangan ${monthName} ${year}`,
        data: [income, expense],
        backgroundColor: ['#34D399', '#EF4444'],
        borderColor: ['#10B981', '#DC2626'],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, ticks: { callback: value => `Rp${formatCurrency(value)}` } }
      },
      plugins: {
        legend: { display: true },
        title: { display: true, text: `Laporan Keuangan ${monthName} ${year}` }
      }
    }
  });
}