let attendees = JSON.parse(localStorage.getItem('attendees')) || [];
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

function saveData() {
  localStorage.setItem('attendees', JSON.stringify(attendees));
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

function addAttendee() {
  const nameInput = document.getElementById('attendeeName');
  const name = nameInput.value.trim();
  if (name && !attendees.includes(name)) {
    attendees.push(name);
    nameInput.value = '';
    updateAttendeeList();
    updatePayerSelect();
    saveData();
    nameInput.focus();
  }
}

function updateAttendeeList() {
  const ul = document.getElementById('attendeeList');
  ul.innerHTML = '';
  attendees.forEach((name, index) => {
    const li = document.createElement('li');
    li.textContent = name;
    const delBtn = document.createElement('button');
    delBtn.textContent = '❌';
    delBtn.onclick = () => {
      attendees.splice(index, 1);
      updateAttendeeList();
      updatePayerSelect();
      saveData();
    };
    li.appendChild(delBtn);
    ul.appendChild(li);
  });
}

function updatePayerSelect() {
  const select = document.getElementById('payerSelect');
  select.innerHTML = '';
  attendees.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });
}

function addExpense() {
  const payer = document.getElementById('payerSelect').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const description = document.getElementById('description').value;
  if (payer && !isNaN(amount) && amount > 0) {
    expenses.push({ payer, amount, description });
    updateExpenseList();
    saveData();
    document.getElementById('amount').value = '';
    document.getElementById('description').value = '';
  }
}

function updateExpenseList() {
  const ul = document.getElementById('expenseList');
  ul.innerHTML = '';
  expenses.forEach((expense, index) => {
    const li = document.createElement('li');
    li.textContent = `${expense.payer} paid $${expense.amount.toFixed(2)} for ${expense.description}`;
    const delBtn = document.createElement('button');
    delBtn.textContent = '❌';
    delBtn.onclick = () => {
      expenses.splice(index, 1);
      updateExpenseList();
      saveData();
    };
    li.appendChild(delBtn);
    ul.appendChild(li);
  });
}

function calculate() {
  const totals = {};
  attendees.forEach(name => totals[name] = 0);
  expenses.forEach(e => totals[e.payer] += e.amount);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const share = totalSpent / attendees.length;
  const balances = attendees.map(name => ({ name, balance: totals[name] - share }));

  const creditors = balances.filter(p => p.balance > 0).sort((a, b) => b.balance - a.balance);
  const debtors = balances.filter(p => p.balance < 0).sort((a, b) => a.balance - b.balance);

  let results = [];
  while (creditors.length && debtors.length) {
    const credit = creditors[0];
    const debit = debtors[0];
    const amount = Math.min(credit.balance, -debit.balance);
    results.push(`${debit.name} pays $${amount.toFixed(2)} to ${credit.name}`);
    credit.balance -= amount;
    debit.balance += amount;
    if (credit.balance === 0) creditors.shift();
    if (debit.balance === 0) debtors.shift();
  }

  document.getElementById('results').innerHTML = results.length ? '<ul>' + results.map(r => `<li>${r}</li>`).join('') + '</ul>' : '<p>All settled!</p>';
  return results;
}

function shareResults() {
  const results = calculate();
  const text = encodeURIComponent('Expense Summary:\n' + results.join('\n'));
  window.open(`https://wa.me/?text=${text}`, '_blank');
}

window.onload = () => {
  updateAttendeeList();
  updatePayerSelect();
  updateExpenseList();
};
