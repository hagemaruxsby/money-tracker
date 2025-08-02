import { supabase } from './supabase.js';

const transactionForm = document.getElementById('transaction-form');
const historyList = document.getElementById('transaction-list');
const balanceDisplay = document.getElementById('balance-display');
const reportsBtn = document.getElementById('nav-reports');

document.addEventListener('DOMContentLoaded', async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || !data.user.email_confirmed_at) {
    console.error("User not authenticated or email not confirmed:", error);
    window.location.href = './index.html';
    return;
  }
  await loadTransactions(data.user.id);
});

reportsBtn.addEventListener('click', async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || !data.user.email_confirmed_at) {
    console.error("User not authenticated or email not confirmed:", error);
    window.location.href = './index.html';
    return;
  }
  window.location.href = './report.html';
  
});

transactionForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const description = document.getElementById('description').value.trim().replace(/[<>]/g, '');
  const amount = parseFloat(document.getElementById('amount').value);
  const price = parseFloat(document.getElementById('price').value);
  const type = document.getElementById('type').value;
  const date = document.getElementById('date').value;

  if (!description || isNaN(amount) || amount <= 0 || isNaN(price) || price <= 0 || !type || !date) {
    alert('Please fill out all fields correctly with positive numbers.');
    return;
  }

  const totalAmount = amount * price;

  const { data, error: authError } = await supabase.auth.getUser();
  if (authError || !data.user || !data.user.email_confirmed_at) {
    alert('User not authenticated or email not confirmed.');
    window.location.href = './index.html';
    return;
  }

  const userId = data.user.id;

  const { error: insertError } = await supabase.from('transactions').insert([
    {
      user_id: userId,
      title: description,
      amount: totalAmount,
      type,
      date
    }
  ]);

  if (insertError) {
    alert('Could not save transaction.');
    console.error('Insert error:', insertError);
    return;
  }

  transactionForm.reset();
  await loadTransactions(userId);
});

async function loadTransactions(userId) {
  historyList.innerHTML = '<li class="p-2">Loading transactions...</li>';
  balanceDisplay.textContent = '';

  const { data, error } = await supabase
    .from('transactions')
    .select('id, user_id, title, amount, type, date')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error("Fetch transactions error:", error);
    historyList.innerHTML = '<li class="p-2 text-red-600">Error loading transactions.</li>';
    return;
  }

  if (!data || data.length === 0) {
    historyList.innerHTML = '<li class="p-2">No transactions found.</li>';
    return;
  }

  console.log('Fetched transactions:', data);

  historyList.innerHTML = '';
  let balance = 0;

  data.forEach(tx => {
    const item = document.createElement('li');
    item.className = 'flex justify-between items-center p-2 border-b';
    const transactionId = tx.id || '';
    const typeText = tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
    const formattedAmount = `Rp${tx.amount.toLocaleString('id-ID')}`;
    const [year, month, day] = tx.date.split('-');
    const formattedDate = `${day}-${month}-${year}`;
    item.innerHTML = `
      <span class="text-gray-800">
        ${formattedDate} - ${tx.title} - 
        <span style="color:${tx.type === 'income' ? 'green' : 'red'};">
          ${typeText} - ${formattedAmount}
        </span>
      </span>
      <button class="remove-btn bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700" data-id="${transactionId}">Remove</button>
    `;
    historyList.appendChild(item);

    if (tx.type === 'income') balance += tx.amount;
    else if (tx.type === 'expense') balance -= tx.amount;
  });

  balanceDisplay.textContent = `Saldo: Rp${balance.toLocaleString('id-ID')}`;
  balanceDisplay.className = `text-lg mb-4 ${balance < 0 ? 'text-red-600' : 'text-green-600'}`;

  const removeButtons = document.querySelectorAll('.remove-btn');
  console.log('Remove buttons found:', removeButtons.length);
  removeButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      const transactionId = e.target.getAttribute('data-id');
      console.log('Attempting to delete transaction ID:', transactionId);
      if (!transactionId) {
        alert('Transaction ID not found.');
        return;
      }
      if (confirm('Are you sure you want to delete this transaction?')) {
        await deleteTransaction(transactionId, userId);
      }
    });
  });
}

async function deleteTransaction(transactionId, userId) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId)
    .eq('user_id', userId);

  if (error) {
    alert('Could not delete transaction.');
    console.error('Delete error:', error);
    return;
  }

  await loadTransactions(userId);
}
