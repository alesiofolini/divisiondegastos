
const attendees = [];
const expenses = [];

window.onload = function () {
  const savedAttendees = JSON.parse(localStorage.getItem("attendees"));
  const savedExpenses = JSON.parse(localStorage.getItem("expenses"));
  if (savedAttendees) {
    attendees.push(...savedAttendees);
    updateAttendeeList();
    updateAutoComplete();
  }
  if (savedExpenses) {
    expenses.push(...savedExpenses);
    updateExpenseList();
  }
};

function addAttendee() {
  const input = document.getElementById("attendeeName");
  const name = input.value.trim();
  if (name && !attendees.includes(name)) {
    attendees.push(name);
    input.value = "";
    updateAttendeeList();
    updateAutoComplete();
    localStorage.setItem("attendees", JSON.stringify(attendees));
  }
  input.focus();
}

function updateAttendeeList() {
  const list = document.getElementById("attendeeList");
  list.innerHTML = "";
  attendees.forEach((name, index) => {
    const li = document.createElement("li");
    li.textContent = name;
    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.onclick = () => {
      attendees.splice(index, 1);
      updateAttendeeList();
      updateAutoComplete();
      localStorage.setItem("attendees", JSON.stringify(attendees));
    };
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

function addExpense() {
  const payer = document.getElementById("payerSelect").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const description = document.getElementById("description").value.trim();

  if (payer && !attendees.includes(payer)) {
    alert("Payer not found in attendees.");
    return;
  }

  if (payer && !isNaN(amount)) {
    expenses.push({ payer, amount, description });
    document.getElementById("payerSelect").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("description").value = "";
    updateExpenseList();
    localStorage.setItem("expenses", JSON.stringify(expenses));
    document.getElementById("payerSelect").focus();
  }
}

function updateExpenseList() {
  const list = document.getElementById("expenseList");
  list.innerHTML = "";
  expenses.forEach((e, i) => {
    const li = document.createElement("li");
    li.textContent = `${e.payer} paid $${e.amount.toFixed(2)} for ${e.description || "something"}`;
    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.onclick = () => {
      expenses.splice(i, 1);
      updateExpenseList();
      localStorage.setItem("expenses", JSON.stringify(expenses));
    };
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

function calculate() {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const perPerson = total / attendees.length;

  const results = document.getElementById("results");
  results.innerHTML = `Total: $${total.toFixed(2)}<br>Each pays: $${perPerson.toFixed(2)}<br><br>`;

  const totals = {};
  attendees.forEach(n => totals[n] = 0);
  expenses.forEach(e => totals[e.payer] += e.amount);

  const balances = attendees.map(n => ({
    name: n,
    balance: totals[n] - perPerson
  }));

  balances.sort((a, b) => a.balance);

  let i = 0, j = balances.length - 1;
  while (i < j) {
    const owe = Math.min(-balances[i].balance, balances[j].balance);
    if (owe > 0.01) {
      results.innerHTML += `${balances[i].name} pays $${owe.toFixed(2)} to ${balances[j].name}<br>`;
      balances[i].balance += owe;
      balances[j].balance -= owe;
    }
    if (Math.abs(balances[i].balance) < 0.01) i++;
    if (Math.abs(balances[j].balance) < 0.01) j--;
  }
}

function updateAutoComplete() {
  new autoComplete({
    selector: "#payerSelect",
    data: {
      src: attendees,
      cache: false
    },
    threshold: 0,
    debounce: 0,
    resultsList: {
      render: true,
      container: source => {
        source.setAttribute("id", "autoComplete_list");
      },
      destination: document.querySelector("#payerSelect"),
      position: "afterend",
      element: "ul"
    },
    resultItem: {
      content: data => data.match,
      element: "li"
    },
    onSelection: feedback => {
      document.querySelector("#payerSelect").value = feedback.selection.value;
    }
  });
}

function shareResults() {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const perPerson = total / attendees.length;

  let message = `💸 Split Summary\nTotal: $${total.toFixed(2)}\nEach pays: $${perPerson.toFixed(2)}\n\n`;

  const totals = {};
  attendees.forEach(n => totals[n] = 0);
  expenses.forEach(e => totals[e.payer] += e.amount);

  const balances = attendees.map(n => ({
    name: n,
    balance: totals[n] - perPerson
  }));

  balances.sort((a, b) => a.balance);

  let i = 0, j = balances.length - 1;
  while (i < j) {
    const owe = Math.min(-balances[i].balance, balances[j].balance);
    if (owe > 0.01) {
      message += `${balances[i].name} ➡️ $${owe.toFixed(2)} ➡️ ${balances[j].name}\n`;
      balances[i].balance += owe;
      balances[j].balance -= owe;
    }
    if (Math.abs(balances[i].balance) < 0.01) i++;
    if (Math.abs(balances[j].balance) < 0.01) j--;
  }

  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/?text=${encoded}`, "_blank");
}
