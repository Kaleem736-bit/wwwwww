function generateWallet() {
  return 'T' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '{}');
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function getTransfers() {
  return JSON.parse(localStorage.getItem('transfers') || '[]');
}

function saveTransfers(transfers) {
  localStorage.setItem('transfers', JSON.stringify(transfers));
}

// واجهة المستخدم
function login() {
  const username = document.getElementById('username').value.trim();
  if (!username) return alert("أدخل اسم المستخدم");

  let users = getUsers();
  if (!users[username]) {
    users[username] = {
      wallet: generateWallet(),
      balance: 0,
      history: []
    };
    saveUsers(users);
  }

  localStorage.setItem('loggedInUser', username);
  location.reload();
}

function logout() {
  localStorage.removeItem('loggedInUser');
  location.reload();
}

window.onload = function () {
  const user = localStorage.getItem('loggedInUser');
  if (user && document.getElementById('wallet')) {
    const users = getUsers();
    const userData = users[user];

    document.getElementById('auth').style.display = 'none';
    document.getElementById('wallet').style.display = 'block';
    document.getElementById('userDisplay').textContent = user;
    document.getElementById('walletAddress').textContent = userData.wallet;
    document.getElementById('balance').textContent = userData.balance.toFixed(2);
    updateHistory(userData.history);
  }
};

function charge() {
  const user = localStorage.getItem('loggedInUser');
  const users = getUsers();
  users[user].balance += Math.random() * 100 + 10;
  users[user].balance = parseFloat(users[user].balance.toFixed(2));
  saveUsers(users);
  location.reload();
}

function transfer() {
  const user = localStorage.getItem('loggedInUser');
  const users = getUsers();
  const fromUser = users[user];

  const toAddress = document.getElementById('toAddress').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);

  if (!toAddress || isNaN(amount) || amount <= 0) {
    return alert("أدخل عنوان ومبلغ صحيح");
  }

  if (fromUser.balance < amount) {
    return alert("الرصيد غير كافٍ");
  }

  fromUser.balance -= amount;
  fromUser.history.push({
    to: toAddress,
    amount,
    time: new Date().toLocaleString()
  });

  // حفظ في سجل التحويلات العام
  let transfers = getTransfers();
  transfers.push({
    from: fromUser.wallet,
    to: toAddress,
    amount,
    time: new Date().toLocaleString()
  });

  saveTransfers(transfers);
  saveUsers(users);
  location.reload();
}

function updateHistory(history) {
  const list = document.getElementById('history');
  list.innerHTML = "";
  history.forEach(h => {
    const li = document.createElement('li');
    li.textContent = `أرسلت ${h.amount} إلى ${h.to} في ${h.time}`;
    list.appendChild(li);
  });
}

// لوحة الإدارة
function adminLogin() {
  const pass = document.getElementById('adminPass').value;
  if (pass === "admin123") {
    document.getElementById('admin-auth').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    loadAdminData();
  } else {
    alert("كلمة مرور خاطئة");
  }
}

function loadAdminData() {
  const users = getUsers();
  const transfers = getTransfers();

  const userList = document.getElementById('userList');
  userList.innerHTML = "";
  for (const [username, data] of Object.entries(users)) {
    const li = document.createElement('li');
    li.textContent = `${username} | ${data.wallet} | ${data.balance.toFixed(2)} USDT`;
    userList.appendChild(li);
  }

  const txList = document.getElementById('allTransfers');
  txList.innerHTML = "";
  transfers.forEach(tx => {
    const li = document.createElement('li');
    li.textContent = `من ${tx.from} إلى ${tx.to} | ${tx.amount} | ${tx.time}`;
    txList.appendChild(li);
  });
}
