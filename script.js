/* ==========================================================
   0. 回到顶部按钮逻辑
   页面滚动 > 300px 显示按钮，点击平滑回顶部
   保护：如果本页没有 #backTop 直接 return
   ========================================================== */
(() => {
  const btn = document.getElementById('backTop');
  if (!btn) return; // 本页没有按钮就退出

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      btn.classList.add('show'); // 显示按钮
    } else {
      btn.classList.remove('show'); // 隐藏按钮
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ==========================================================
   1. 商品列表页逻辑   →   list.html
   生成 10 条假数据 → 渲染网格 → 点击跳详情
   ========================================================== */
if (document.querySelector('.goods-box')) {
  // 1-1 假数据：后续可替换为后端接口
  const goods = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    title: `商品 ${i + 1}`,
    price: (Math.random() * 1000 + 99).toFixed(2),
    cover: `img/${String(i % 3 + 1).padStart(2, '0')}.jpg` // 循环用 01 02 03 图
  }));

  // 1-2 渲染网格
  const box = document.querySelector('.goods-box');
  box.innerHTML = goods.map(g => `
    <div class="goods-card" onclick="goDetail(${g.id})">
      <img src="${g.cover}" alt="">
      <div class="goods-info">
        <div class="goods-title">${g.title}</div>
        <div class="goods-price">¥${g.price}</div>
      </div>
    </div>
  `).join('');
}

/* 1-3 公共跳转函数 → 详情页 */
window.goDetail = id => location.href = `detail.html?id=${id}`;

/* ==========================================================
   2. 商品详情页逻辑   →   detail.html
   读取 URL 参数 → 渲染详情 → 加入购物车
   ========================================================== */
if (document.querySelector('.detail-box')) {
  // 2-1 同一份假数据，保持 id 对应
  const goods = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    title: `商品 ${i + 1}`,
    price: (Math.random() * 1000 + 99).toFixed(2),
    stock: Math.floor(Math.random() * 50) + 10,
    cover: `img/${String(i % 3 + 1).padStart(2, '0')}.jpg`,
    desc: '这是一条炫酷的商品描述，穿上它/用上它，人生巅峰！'
  }));

  // 2-2 解析 URL 参数 ?id=xx
  const id = Number(new URLSearchParams(location.search).get('id'));

  // 2-3 找不到商品时给出友好提示
  const g = goods.find(item => item.id === id);
  if (!g) {
    document.querySelector('.detail-box').innerHTML = '<p>找不到该商品</p>';
  } else {
    // 2-4 渲染详情
    document.querySelector('.detail-box').innerHTML = `
      <div class="detail-left">
        <img src="${g.cover}" alt="">
      </div>
      <div class="detail-right">
        <div class="detail-title">${g.title}</div>
        <div class="detail-price">¥${g.price}</div>
        <div class="detail-stock">库存：${g.stock} 件</div>
        <button class="detail-btn" onclick="addCart(${g.id})">加入购物车</button>
      </div>
    `;
  }

  // 2-5 加入购物车 → 写入 localStorage
  window.addCart = id => {
    const cart = JSON.parse(localStorage.getItem('cart') || '{}');
    cart[id] = (cart[id] || 0) + 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('已加入购物车！');
  };
}

/* ==========================================================
   3. 购物车页逻辑  →  cart.html
   读取 cart → 渲染表格 → 加减数量 → 计算总价
   ========================================================== */
if (document.querySelector('.cart-table')) {
  // 3-1 假数据（与详情页同一份）
  const goods = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    title: `商品 ${i + 1}`,
    price: (Math.random() * 1000 + 99).toFixed(2),
    cover: `img/${String(i % 3 + 1).padStart(2, '0')}.jpg`
  }));

  // 3-2 读取本地购物车
  const cart = JSON.parse(localStorage.getItem('cart') || '{}');

  // 3-3 渲染函数（可反复调用）
  const tbody = document.querySelector('.cart-table tbody');
  function renderCart() {
    tbody.innerHTML = '';
    let total = 0;
    for (const id in cart) {
      const g = goods.find(item => item.id === Number(id));
      if (!g) continue;
      const num = cart[id];
      const sub = (g.price * num).toFixed(2);
      total += Number(sub);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${g.title}</td>
        <td>¥${g.price}</td>
        <td>
          <span class="qty-btn" onclick="changeQty(${id},-1)">-</span>
          <input class="qty-input" value="${num}" readonly>
          <span class="qty-btn" onclick="changeQty(${id},1)">+</span>
        </td>
        <td>¥${sub}</td>
        <td><button onclick="removeItem(${id})">删除</button></td>
      `;
      tbody.appendChild(tr);
    }
    document.getElementById('total').textContent = `¥${total.toFixed(2)}`;
  }

  // 3-4 数量加减
  window.changeQty = (id, delta) => {
    const newNum = cart[id] + delta;
    if (newNum <= 0) {
      removeItem(id);
    } else {
      cart[id] = newNum;
      localStorage.setItem('cart', JSON.stringify(cart));
      renderCart();
    }
  };

  // 3-5 删除商品
  window.removeItem = id => {
    delete cart[id];
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
  };

  // 3-6 首次进入自动渲染
  renderCart();
}

/* ==========================================================
   4. 订单确认页逻辑  →  confirm.html
   读取购物车 → 渲染清单 → 选地址 → 生成订单对象
   ========================================================== */
if (document.querySelector('.confirm-box')) {
  const goods = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    title: `商品 ${i + 1}`,
    price: (Math.random() * 1000 + 99).toFixed(2)
  }));
  const cart = JSON.parse(localStorage.getItem('cart') || '{}');
  const freight = 10; // 固定运费

  const tbody = document.querySelector('.confirm-table tbody');
  let goodsTotal = 0;
  for (const id in cart) {
    const g = goods.find(item => item.id === Number(id));
    if (!g) continue;
    const num = cart[id];
    const sub = (g.price * num).toFixed(2);
    goodsTotal += Number(sub);
    tbody.innerHTML += `
      <tr>
        <td>${g.title}</td>
        <td>¥${g.price}</td>
        <td>${num}</td>
        <td>¥${sub}</td>
      </tr>`;
  }
  document.getElementById('goodsTotal').textContent = `¥${goodsTotal.toFixed(2)}`;
  document.getElementById('finalTotal').textContent = `¥${(goodsTotal + freight).toFixed(2)}`;

  // 4-1 提交订单 → 生成订单对象 → 跳支付页
  window.submitOrder = () => {
    const addr = document.getElementById('addrSelect').value === '0'
      ? '北京市海淀区xxx路001号'
      : '上海市浦东新区yyy路002号';
    const order = {
      orderNo: 'O' + Date.now(),
      goods: cart,
      addr: addr,
      total: (goodsTotal + freight).toFixed(2),
      status: '待支付'
    };
    localStorage.setItem('currentOrder', JSON.stringify(order));
    localStorage.removeItem('cart'); // 可选：清空购物车
    location.href = 'pay.html';
  };
}

/* ==========================================================
   5. 支付页逻辑  →  pay.html
   模拟支付 1.5s → 改状态 → 存入历史订单 → 跳订单列表
   ========================================================== */
if (document.querySelector('.pay-box')) {
  const order = JSON.parse(localStorage.getItem('currentOrder'));
  if (!order) {
    alert('无待支付订单');
    location.href = 'index.html';
  } else {
    document.getElementById('orderNo').textContent = order.orderNo;
    document.getElementById('payAmount').textContent = `¥${order.total}`;
  }

  window.doPay = () => {
    const method = document.querySelector('input[name="pay"]:checked').value;
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = '支付中...';
    setTimeout(() => {
      order.status = '已完成';
      const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      history.unshift(order); // 最新订单放最前
      localStorage.setItem('orderHistory', JSON.stringify(history));
      localStorage.removeItem('currentOrder');
      alert('支付成功！');
      location.href = 'orders.html';
    }, 1500);
  };
}

/* ==========================================================
   6. 我的订单页逻辑  →  orders.html
   倒序列出历史订单 → 点击头部展开商品清单
   ========================================================== */
if (document.querySelector('.orders-box')) {
  const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
  const emptyTip = document.getElementById('emptyTip');
  const ordersList = document.getElementById('ordersList');

  if (history.length === 0) {
    emptyTip.style.display = 'block';
  } else {
    history.forEach(order => {
      const div = document.createElement('div');
      div.className = 'order-item';

      const head = document.createElement('div');
      head.className = 'order-head';
      head.innerHTML = `
        <div>
          <div>订单号：${order.orderNo}</div>
          <span>地址：${order.addr}</span>
        </div>
        <div>
          <div class="order-status ${order.status === '已完成' ? 'done' : 'pending'}">${order.status}</div>
          <div>¥${order.total}</div>
        </div>
      `;

      const goodsBox = document.createElement('div');
      goodsBox.className = 'order-goods';
      for (const id in order.goods) {
        const fakeTitle = `商品 ${id}`;
        goodsBox.innerHTML += `<p>${fakeTitle} × ${order.goods[id]}</p>`;
      }
      head.onclick = () => goodsBox.style.display = goodsBox.style.display === 'block' ? 'none' : 'block';

      div.appendChild(head);
      div.appendChild(goodsBox);
      ordersList.appendChild(div);
    });
  }
}

/* ==========================================================
   7. 注册 / 登录 / 顶部状态 / 退出
   纯 localStorage 存用户表，无加密（demo 级）
   ========================================================== */
function doReg() {
  const name = document.getElementById('regName').value.trim();
  const pwd = document.getElementById('regPwd').value;
  const pwd2 = document.getElementById('regPwd2').value;
  if (pwd !== pwd2) { alert('两次密码不一致！'); return false; }
  const users = JSON.parse(localStorage.getItem('users') || '{}');
  if (users[name]) { alert('用户名已存在！'); return false; }
  users[name] = pwd;
  localStorage.setItem('users', JSON.stringify(users));
  alert('注册成功！即将跳转登录页');
  location.href = 'login.html';
  return false;
}

function doLogin() {
  const name = document.getElementById('loginName').value.trim();
  const pwd = document.getElementById('loginPwd').value;
  const users = JSON.parse(localStorage.getItem('users') || '{}');
  if (!users[name]) { alert('用户名不存在！'); return false; }
  if (users[name] !== pwd) { alert('密码错误！'); return false; }
  localStorage.setItem('curUser', name);
  const back = new URLSearchParams(location.search).get('back');
  location.href = back || 'index.html';
  return false;
}

(function () {
  const curUser = localStorage.getItem('curUser');
  const authBox = document.querySelector('.auth');
  if (!authBox) return;
  if (curUser) {
    const links = `<a href="list.html">商品列表</a><a href="cart.html">购物车</a>`;
    authBox.innerHTML = `欢迎，${curUser}<a href="#" onclick="doLogout();return false;">退出</a>${links}`;
  } else {
    authBox.innerHTML = `<a href="login.html">登录</a><a href="reg.html">注册</a><a href="list.html">商品列表</a><a href="cart.html">购物车</a>`;
  }
})();

function doLogout() {
  if (confirm('确定要退出吗？')) {
    localStorage.removeItem('curUser');
    location.reload();
  }
}

function goCheckout() {
  if (!localStorage.getItem('curUser')) {
    alert('请先登录！');
    location.href = 'login.html?back=' + encodeURIComponent(location.href);
    return;
  }
  location.href = 'confirm.html';
}

/* ==========================================================
   8. 首页热销榜（销量统计）
   读取 orderHistory → 累加销量 → 排序 → 渲染前 N 个
   ========================================================== */
if (document.querySelector('.home-hot')) {
  const goods = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    title: `商品 ${i + 1}`,
    price: (Math.random() * 1000 + 99).toFixed(2),
    cover: `img/${String(i % 3 + 1).padStart(2, '0')}.jpg`
  }));
  const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
  const sales = {};
  history.forEach(order => {
    for (const id in order.goods) sales[id] = (sales[id] || 0) + order.goods[id];
  });
  const sorted = Object.entries(sales).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id, num]) => ({ id: Number(id), num }));
  const hotBox = document.getElementById('hotBox');
  if (sorted.length === 0) {
    hotBox.innerHTML = '<p style="text-align:center;color:#999;">暂无销量数据，快去下单吧！</p>';
  } else {
    hotBox.innerHTML = sorted.map(({ id, num }) => {
      const g = goods.find(item => item.id === id);
      return `
        <div class="hot-item" onclick="goDetail(${id})">
          <img src="${g.cover}" alt="">
          <div class="hot-info">
            <div class="hot-title">${g.title}</div>
            <div class="hot-price">¥${g.price}</div>
            <div class="hot-sales">已售 ${num} 件</div>
          </div>
        </div>`;
    }).join('');
  }
}
