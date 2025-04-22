// Expense Splitter JS

let attendees = JSON.parse(localStorage.getItem('attendees')) || [];
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

window.onload = () => {
  renderAttendees();
  renderExpenses();
  updatePayerDropdown();
};

function saveData() {
  localStorage.setItem('attendees', JSON.stringify(attendees));
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

function addAttendee() {
  const nameInput = document.getElementById('attendeeName');
  const name = nameInput.value.trim();
  if (name && !attendees.includes(name)) {
    attendees.push(name);
    saveData();
    renderAttendees();
    updatePayerDropdown();
  }
  nameInput.value = '';
  nameInput.focus();
}

function renderAttendees() {
  const list = document.getElementById('attendeeList');
  list.innerHTML = '';
  attendees.forEach((name, index) => {
    const li = document.createElement('li');
    li.textContent = name;
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => editAttendee(index);
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteAttendee(index);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

function editAttendee(index) {
  const newName = prompt('Edit name:', attendees[index]);
  if (newName && newName.trim()) {
    const oldName = attendees[index];
    attendees[index] = newName.trim();
    expenses.forEach(exp => {
      if (exp.payer === oldName) exp.payer = newName.trim();
    });
    saveData();
    renderAttendees();
    renderExpenses();
    updatePayerDropdown();
  }
}

function deleteAttendee(index) {
  const name = attendees[index];
  if (confirm(`Delete ${name}?`)) {
    attendees.splice(index, 1);
    expenses = expenses.filter(exp => exp.payer !== name);
    saveData();
    renderAttendees();
    renderExpenses();
    updatePayerDropdown();
  }
}

function updatePayerDropdown() {
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
  const description = document.getElementById('description').value.trim();
  if (payer && amount && description) {
    expenses.push({ payer, amount, description });
    saveData();
    renderExpenses();
    document.getElementById('amount').value = '';
    document.getElementById('description').value = '';
  }
}

function renderExpenses() {
  const list = document.getElementById('expenseList');
  list.innerHTML = '';
  expenses.forEach((exp, index) => {
    const li = document.createElement('li');
    li.textContent = `${exp.payer} paid $${exp.amount.toFixed(2)} for ${exp.description}`;
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteExpense(index);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

function deleteExpense(index) {
  expenses.splice(index, 1);
  saveData();
  renderExpenses();
}

function calculate() {
  const totals = {};
  const perPerson = {};

  attendees.forEach(name => {
    totals[name] = 0;
    perPerson[name] = 0;
  });

  expenses.forEach(exp => {
    totals[exp.payer] += exp.amount;
    const share = exp.amount / attendees.length;
    attendees.forEach(name => {
      perPerson[name] += share;
    });
  });

  const balances = attendees.map(name => ({
    name,
    balance: totals[name] - perPerson[name]
  })).sort((a, b) => a.balance - b.balance);

  const results = [];
  let i = 0, j = balances.length - 1;
  while (i < j) {
    const owe = Math.min(-balances[i].balance, balances[j].balance);
    if (owe > 0.01) {
      results.push(`${balances[i].name} pays $${owe.toFixed(2)} to ${balances[j].name}`);
      balances[i].balance += owe;
      balances[j].balance -= owe;
    }
    if (Math.abs(balances[i].balance) < 0.01) i++;
    if (Math.abs(balances[j].balance) < 0.01) j--;
  }

  document.getElementById('results').innerHTML = results.join('<br>');
}

function shareResults() {
  const text = document.getElementById('results').innerText;
  if (text) {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }
}
