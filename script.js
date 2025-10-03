(() => {
  const btn = document.getElementById('backTop');
  if (!btn) return;          
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  });
  btn.addEventListener('click', () => {
    window.scrollTo({top:0, behavior:'smooth'});
  });
})();

/* ===== 商品列表页逻辑 ===== */
if (document.querySelector('.goods-box')) {
  // 1. 假数据（10 条）
  const goods = Array.from({length:10}, (_,i)=>({
    id: i+1,
    title: `商品 ${i+1}`,
    price: (Math.random()*1000+99).toFixed(2),
    cover: `img/${String(i%3+1).padStart(2,'0')}.jpg` // 循环用 01 02 03 图
  }));

  // 2. 渲染
  const box = document.querySelector('.goods-box');
  box.innerHTML = goods.map(g=>`
    <div class="goods-card" onclick="goDetail(${g.id})">
      <img src="${g.cover}" alt="">
      <div class="goods-info">
        <div class="goods-title">${g.title}</div>
        <div class="goods-price">¥${g.price}</div>
      </div>
    </div>
  `).join('');  
}

window.goDetail = id => location.href = 'detail.html?id=' + id;

/* ===== 商品详情页逻辑 ===== */
if (document.querySelector('.detail-box')) {
  // 1. 假数据（和列表页同一份，实际可抽成单独文件）
  const goods = Array.from({length:10}, (_,i)=>({
    id: i+1,
    title: `商品 ${i+1}`,
    price: (Math.random()*1000+99).toFixed(2),
    stock: Math.floor(Math.random()*50)+10,
    cover: `img/${String(i%3+1).padStart(2,'0')}.jpg`,
    desc: '这是一条炫酷的商品描述，穿上它/用上它，人生巅峰！'
  }));

  // 2. 取 URL 里的 id
  const id = Number(new URLSearchParams(location.search).get('id'));

  // 3. 找到商品
  const g = goods.find(item => item.id === id);
  if (!g) {
    document.querySelector('.detail-box').innerHTML = '<p>找不到该商品</p>';
  } else {
    // 4. 渲染
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

  // 5. 加入购物车函数（先存 localStorage）
  window.addCart = id => {
    // 假设购物车结构： { "1": 2, "2": 1 }  键是 id，值是数量
    const cart = JSON.parse(localStorage.getItem('cart') || '{}');
    cart[id] = (cart[id] || 0) + 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('已加入购物车！');
  };
}

/* ===== 购物车页逻辑 ===== */
if (document.querySelector('.cart-table')) {
  // 1. 假数据（同一份，抽出来可复用）
  const goods = Array.from({length:10}, (_,i)=>({
    id: i+1,
    title: `商品 ${i+1}`,
    price: (Math.random()*1000+99).toFixed(2),
    cover: `img/${String(i%3+1).padStart(2,'0')}.jpg`
  }));

  // 2. 读购物车
  const cart = JSON.parse(localStorage.getItem('cart') || '{}'); // { "1": 2, "2": 1 }

  // 3. 渲染
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

  // 4. 数量加减
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

  // 5. 删除
  window.removeItem = id => {
    delete cart[id];
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
  };

  // 6. 首次渲染
  renderCart();
}

/* ===== 订单确认页逻辑 ===== */
if (document.querySelector('.confirm-box')) {
  // 1. 假数据（同一份）
  const goods = Array.from({length:10}, (_,i)=>({
    id: i+1, title: `商品 ${i+1}`, price: (Math.random()*1000+99).toFixed(2)
  }));

  // 2. 读购物车
  const cart = JSON.parse(localStorage.getItem('cart') || '{}');
  const freight = 10; // 运费写死 10 元

  // 3. 渲染商品清单
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

  // 4. 提交订单
  window.submitOrder = () => {
    const addr = document.getElementById('addrSelect').value === '0'
               ? '北京市海淀区xxx路001号'
               : '上海市浦东新区yyy路002号';
    const order = {
      orderNo: 'O' + Date.now(),          // 假订单号
      goods: cart,
      addr: addr,
      total: (goodsTotal + freight).toFixed(2),
      status: '待支付'
    };
    // 把订单存起来（后面支付页用）
    localStorage.setItem('currentOrder', JSON.stringify(order));
    // 清空购物车（可选）
    localStorage.removeItem('cart');
    // 跳到支付页
    location.href = 'pay.html';
  };
}

/* ===== 支付页逻辑 ===== */
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
    // 模拟支付中
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = '支付中...';
    setTimeout(() => {
      // 支付成功：把订单状态改为“已完成”并存入历史
      order.status = '已完成';
      const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      history.unshift(order);   // 最新订单放最前
      localStorage.setItem('orderHistory', JSON.stringify(history));
      localStorage.removeItem('currentOrder'); // 清除待支付
      alert('支付成功！');
      location.href = 'orders.html'; // 跳转到“我的订单”
    }, 1500);
  };
}

/* ===== 我的订单页逻辑 ===== */
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

      // 头部信息
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

      // 商品清单
      const goodsBox = document.createElement('div');
      goodsBox.className = 'order-goods';
      for (const id in order.goods) {
        // 假数据里拿标题（实际可存快照）
        const fakeTitle = `商品 ${id}`;
        goodsBox.innerHTML += `<p>${fakeTitle} × ${order.goods[id]}</p>`;
      }

      // 点击头部展开/收起
      head.onclick = () => goodsBox.style.display = goodsBox.style.display === 'block' ? 'none' : 'block';

      div.appendChild(head);
      div.appendChild(goodsBox);
      ordersList.appendChild(div);
    });
  }
}

/* ===== 注册逻辑 ===== */
function doReg() {
  const name = document.getElementById('regName').value.trim();
  const pwd  = document.getElementById('regPwd').value;
  const pwd2 = document.getElementById('regPwd2').value;
  if (pwd !== pwd2) { alert('两次密码不一致！'); return false; }

  const users = JSON.parse(localStorage.getItem('users') || '{}');
  if (users[name]) { alert('用户名已存在！'); return false; }

  users[name] = pwd; // 明文存密码（demo 级）
  localStorage.setItem('users', JSON.stringify(users));
  alert('注册成功！即将跳转登录页');
  location.href = 'login.html';
  return false; // 阻止表单提交
}

/* ===== 登录逻辑 ===== */
function doLogin() {
  const name = document.getElementById('loginName').value.trim();
  const pwd  = document.getElementById('loginPwd').value;

  const users = JSON.parse(localStorage.getItem('users') || '{}');
  if (!users[name]) { alert('用户名不存在！'); return false; }
  if (users[name] !== pwd) { alert('密码错误！'); return false; }

  // 登录成功：写缓存 + 跳首页
  // 登录成功
  localStorage.setItem('curUser', name);
  const back = new URLSearchParams(location.search).get('back');
  location.href = back || 'index.html';   // 有来源就回去，没有就回首页
  return false;
}

/* ===== 顶部状态切换 ===== */
(function () {
  const curUser = localStorage.getItem('curUser');
  const authBox = document.querySelector('.auth'); // 找到横幅右侧容器
  if (!authBox) return;          // 本页没有横幅就跳过

  if (curUser) {
  // ① 已登录
  // ① 保留原有功能链接
  const links = `
      <a href="list.html">商品列表</a>
      <a href="cart.html">购物车</a>
  `;

  // ② 把登录/注册区域换成欢迎+退出
  authBox.innerHTML = `
    欢迎，${curUser}
    <a href="#" onclick="doLogout();return false;">退出</a>
    ${links}
  `;
  } else {
    // ② 未登录
    authBox.innerHTML = `
      <a href="login.html">登录</a>
      <a href="reg.html">注册</a>
      <a href="list.html">商品列表</a>
      <a href="cart.html">购物车</a>
    `;
  }
})();

/* ===== 退出 ===== */
function doLogout() {
  if (confirm('确定要退出吗？')) {
    localStorage.removeItem('curUser');
    location.reload(); // 刷新即可
  }
}

function goCheckout() {
  if (!localStorage.getItem('curUser')) {
    // 没登录
    alert('请先登录！');
    location.href = 'login.html?back=' + encodeURIComponent(location.href); // 记录来源
    return;
  }
  // 已登录
  location.href = 'confirm.html';
}

/* ===== 首页热销榜 ===== */
if (document.querySelector('.home-hot')) {
  // 1. 假数据（同详情页）
  const goods = Array.from({length:10}, (_,i)=>({
    id: i+1,
    title: `商品 ${i+1}`,
    price: (Math.random()*1000+99).toFixed(2),
    cover: `img/${String(i%3+1).padStart(2,'0')}.jpg`
  }));

  // 2. 销量统计
  const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
  const sales = {}; // { 商品id: 销量 }
  history.forEach(order => {
    for (const id in order.goods) {
      sales[id] = (sales[id] || 0) + order.goods[id];
    }
  });

  // 3. 排序并取前 6 个
  const sorted = Object.entries(sales)
                       .sort((a, b) => b[1] - a[1])
                       .slice(0, 6)
                       .map(([id, num]) => ({ id: Number(id), num }));

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

