import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import {
  Boxes,
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  Search,
  Plus,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  X,
  Check,
  Pencil,
  Trash2,
  ArrowUpRight,
  Menu
} from 'lucide-react';

import './style.css';

/* =====================================================
   API CONFIGURATION
===================================================== */

const API = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

const readSession = () => {
  try {
    return JSON.parse(
      localStorage.getItem('stockpilot_session') || 'null'
    );
  } catch {
    return null;
  }
};

/* =====================================================
   COMMON API FUNCTION
===================================================== */

async function api(path, options = {}) {

  if (!API) {
    throw new Error(
      'API URL is missing. Please configure VITE_API_BASE_URL in Vercel.'
    );
  }

  const session = readSession();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (session?.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }

  let response;

  try {

    response = await fetch(`${API}${path}`, {
      ...options,
      headers
    });

  } catch (error) {
    console.error('API network/CORS error:', error);
    throw new Error(
      `Could not reach the backend at ${API}. Check that the Render service is running and FRONTEND_URLS on Render includes this exact Vercel origin.`
    );
  }

  if (response.status === 204) {
    return null;
  }

  const raw = await response.text();

  let data = null;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }

  if (!response.ok) {

    throw new Error(
      data?.message ||
      data?.detail ||
      (typeof data === 'string'
        ? data
        : `Request failed (${response.status} ${response.statusText})`)
    );

  }

  return data;
}

/* =====================================================
   COMMON HELPERS
===================================================== */

const money = (v) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(v || 0));

const date = (v) =>
  v
    ? new Date(v).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : '—';


/* =====================================================
   AUTH SCREEN
===================================================== */

function AuthScreen({ onAuth }) {

  const [mode, setMode] = useState('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');


  async function submit(e) {

    e.preventDefault();

    setBusy(true);
    setError('');

    try {

      const endpoint =
        mode === 'login'
          ? '/api/auth/login'
          : '/api/auth/signup';

      const payload =
        mode === 'login'
          ? {
              email,
              password
            }
          : {
              name,
              email,
              password
            };

      const data = await api(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const token = data?.token || data?.accessToken;

      if (!token) {

        throw new Error(
          'Authentication response does not contain a JWT token. Please check your backend response.'
        );

      }

      const sessionData = {
        ...data,
        token
      };

      localStorage.setItem(
        'stockpilot_session',
        JSON.stringify(sessionData)
      );

      onAuth(sessionData);

    } catch (e) {

      setError(e.message);

    } finally {

      setBusy(false);

    }

  }


  return (

    <div className="auth-shell">

      <div className="auth-art">

        <div className="brand brand-light">

          <div className="brand-mark">
            <Boxes size={22} />
          </div>

          <span>StockPilot</span>

        </div>


        <div className="art-copy">

          <span className="eyebrow">
            INVENTORY, SIMPLIFIED
          </span>

          <h1>
            Your stock.
            <br />
            Under control.
          </h1>

          <p>
            One clear view of products, orders, and the numbers
            that keep your business moving.
          </p>


          <div className="art-stats">

            <div>
              <strong>01</strong>
              <span>Track stock</span>
            </div>

            <div>
              <strong>02</strong>
              <span>Manage orders</span>
            </div>

            <div>
              <strong>03</strong>
              <span>Grow smarter</span>
            </div>

          </div>

        </div>


        <div className="art-orb orb-one" />
        <div className="art-orb orb-two" />
        <div className="art-grid" />

      </div>


      <div className="auth-panel">

        <div className="auth-mobile-brand">

          <div className="brand-mark">
            <Boxes size={22} />
          </div>

          <b>StockPilot</b>

        </div>


        <div className="auth-card">

          <div className="eyebrow">
            WELCOME {mode === 'login' ? 'BACK' : 'ABOARD'}
          </div>


          <h2>
            {mode === 'login'
              ? 'Sign in to your account'
              : 'Create your account'}
          </h2>


          <p className="muted">
            {mode === 'login'
              ? 'Enter your details to access your workspace.'
              : 'Get started with your inventory workspace.'}
          </p>


          <form
            onSubmit={submit}
            className="stack-form"
          >

            {mode === 'signup' && (

              <label>

                Full name

                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  maxLength="80"
                />

              </label>

            )}


            <label>

              Email address

              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

            </label>


            <label>

              Password

              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={
                  mode === 'signup'
                    ? 'At least 8 characters'
                    : 'Your password'
                }
                minLength={mode === 'signup' ? 8 : 1}
                required
              />

            </label>


            {error && (

              <div className="error-box">
                {error}
              </div>

            )}


            <button
              className="btn btn-primary btn-full"
              disabled={busy}
            >

              {busy
                ? 'Please wait…'
                : mode === 'login'
                  ? 'Sign in'
                  : 'Create account'}

              <ArrowUpRight size={17} />

            </button>

          </form>


          <p className="auth-switch">

            {mode === 'login'
              ? 'New to StockPilot?'
              : 'Already have an account?'}

            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
              }}
            >

              {mode === 'login'
                ? 'Create account'
                : 'Sign in'}

            </button>

          </p>


          <p className="fine-print">
            By continuing, you agree to use this workspace responsibly.
          </p>

        </div>

      </div>

    </div>

  );

}


/* =====================================================
   MAIN APP
===================================================== */

function App() {

  const [session, setSession] = useState(readSession);

  const [tab, setTab] = useState('Overview');

  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  const [query, setQuery] = useState('');

  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const [modal, setModal] = useState('');
  const [editing, setEditing] = useState(null);

  const [mobileNav, setMobileNav] = useState(false);


  const [productForm, setProductForm] = useState({
    name: '',
    category: 'General',
    price: '',
    quantity: '0'
  });


  const [orderForm, setOrderForm] = useState({
    customerName: '',
    productId: '',
    quantity: '1'
  });


  const nav = [
    {
      label: 'Overview',
      icon: LayoutDashboard
    },
    {
      label: 'Products',
      icon: Package
    },
    {
      label: 'Orders',
      icon: ShoppingCart
    }
  ];


  /* =====================================================
     LOGOUT
  ===================================================== */

  function logout() {

    localStorage.removeItem('stockpilot_session');

    setSession(null);

    setSummary(null);
    setProducts([]);
    setOrders([]);
    setLowStock([]);

    setError('');
    setNotice('');

  }


  /* =====================================================
     LOAD DASHBOARD DATA
  ===================================================== */

  async function loadAll() {

    if (!readSession()?.token) {
      return;
    }

    setLoading(true);
    setError('');

    try {

      const [s, p, o, l] = await Promise.all([

        api('/api/dashboard/summary'),

        api('/api/products'),

        api('/api/orders'),

        api('/api/products/low-stock')

      ]);


      setSummary(s);

      setProducts(Array.isArray(p) ? p : []);

      setOrders(Array.isArray(o) ? o : []);

      setLowStock(Array.isArray(l) ? l : []);


    } catch (e) {

      setError(e.message);

      if (
        /401|403|token|unauthor/i.test(e.message)
      ) {

        logout();

      }

    } finally {

      setLoading(false);

    }

  }


  /* =====================================================
     INITIAL DATA LOAD
  ===================================================== */

  useEffect(() => {

    if (session?.token) {
      loadAll();
    }

  }, [session?.token]);


  /* =====================================================
     AUTO HIDE NOTIFICATION
  ===================================================== */

  useEffect(() => {

    if (!notice) return;

    const t = setTimeout(() => {
      setNotice('');
    }, 3500);

    return () => clearTimeout(t);

  }, [notice]);


  /* =====================================================
     SEARCH PRODUCTS
  ===================================================== */

  const filteredProducts = useMemo(

    () =>

      products.filter(p =>

        `${p.name} ${p.category}`
          .toLowerCase()
          .includes(query.toLowerCase())

      ),

    [products, query]

  );


  /* =====================================================
     PRODUCT FUNCTIONS
  ===================================================== */

  function openProduct(product = null) {

    setEditing(product);

    setProductForm(

      product

        ? {
            name: product.name,
            category: product.category,
            price: String(product.price),
            quantity: String(product.quantity)
          }

        : {
            name: '',
            category: 'General',
            price: '',
            quantity: '0'
          }

    );

    setModal('product');

  }


  async function saveProduct(e) {

    e.preventDefault();

    try {

      const body = {

        name: productForm.name.trim(),

        category: productForm.category.trim(),

        price: Number(productForm.price),

        quantity: Number(productForm.quantity)

      };


      await api(

        editing

          ? `/api/products/${editing.id}`

          : '/api/products',

        {

          method: editing ? 'PUT' : 'POST',

          body: JSON.stringify(body)

        }

      );


      setModal('');

      setNotice(
        editing
          ? 'Product updated'
          : 'Product added'
      );

      loadAll();


    } catch (e) {

      setError(e.message);

    }

  }


  async function deleteProduct(p) {

    if (
      !confirm(`Remove ${p.name} from active products?`)
    ) {
      return;
    }

    try {

      await api(`/api/products/${p.id}`, {
        method: 'DELETE'
      });


      setNotice('Product removed');

      loadAll();


    } catch (e) {

      setError(e.message);

    }

  }


  async function changeStock(p) {

    const input = prompt(
      `Enter stock change for ${p.name} (use a positive or negative number):`,
      '5'
    );

    if (input === null || input.trim() === '') {
      return;
    }

    const quantity = Number(input);

    if (!Number.isFinite(quantity) || quantity === 0) {
      return;
    }

    try {

      await api(`/api/products/${p.id}/stock`, {

        method: 'PATCH',

        body: JSON.stringify({
          change: quantity
        })

      });


      setNotice('Stock updated');

      loadAll();


    } catch (e) {

      setError(e.message);

    }

  }


  /* =====================================================
     ORDER FUNCTIONS
  ===================================================== */

  async function createOrder(e) {

    e.preventDefault();

    try {

      await api('/api/orders', {

        method: 'POST',

        body: JSON.stringify({

          customerName: orderForm.customerName.trim(),

          items: [

            {

              productId: Number(orderForm.productId),

              quantity: Number(orderForm.quantity)

            }

          ]

        })

      });


      setModal('');

      setOrderForm({

        customerName: '',

        productId: '',

        quantity: '1'

      });


      setNotice('Order created and stock adjusted');

      loadAll();


    } catch (e) {

      setError(e.message);

    }

  }


  async function setOrderStatus(order, status) {

    try {

      await api(

        `/api/orders/${order.orderId}/status`,

        {

          method: 'PATCH',

          body: JSON.stringify({
            status
          })

        }

      );


      setNotice(
        `Order #${order.orderId} marked ${status.toLowerCase()}`
      );

      loadAll();


    } catch (e) {

      setError(e.message);

    }

  }


  /* =====================================================
     AUTH CHECK
  ===================================================== */

  if (!session?.token) {

    return (
      <AuthScreen onAuth={setSession} />
    );

  }


  /* =====================================================
     MAIN APPLICATION UI
  ===================================================== */

  return (

    <div className="app-shell">


      {/* SIDEBAR */}

      <aside
        className={`sidebar ${
          mobileNav ? 'sidebar-open' : ''
        }`}
      >


        <div className="brand">

          <div className="brand-mark">
            <Boxes size={21} />
          </div>

          <span>StockPilot</span>

          <span className="brand-dot">●</span>

        </div>


        <div className="workspace-label">
          WORKSPACE
        </div>


        <nav>

          {nav.map(n => (

            <button

              key={n.label}

              className={`nav-item ${
                tab === n.label ? 'active' : ''
              }`}

              onClick={() => {

                setTab(n.label);

                setMobileNav(false);

              }}

            >

              <n.icon size={18} />

              <span>{n.label}</span>


              {n.label === 'Products' && (

                <span className="nav-count">
                  {products.length}
                </span>

              )}

            </button>

          ))}

        </nav>


        <div className="sidebar-bottom">


          <div className="help-card">

            <div className="help-icon">
              <TrendingUp size={18} />
            </div>

            <b>Keep stock healthy</b>

            <p>
              Review low-stock items before they run out.
            </p>

            <button
              onClick={() => {
                setTab('Products');
                setQuery('');
              }}
            >

              Review inventory

              <ArrowUpRight size={14} />

            </button>

          </div>


          <div className="user-row">

            <div className="avatar">

              {(session.name || 'U')
                .slice(0, 1)
                .toUpperCase()}

            </div>


            <div className="user-meta">

              <b>{session.name}</b>

              <span>{session.email}</span>

            </div>


            <button

              className="icon-btn logout-btn"

              title="Sign out"

              onClick={logout}

            >

              <LogOut size={17} />

            </button>

          </div>

        </div>

      </aside>


      {/* MAIN CONTENT */}

      <main className="main-area">


        {/* TOPBAR */}

        <header className="topbar">


          <button

            className="icon-btn mobile-menu"

            onClick={() => setMobileNav(!mobileNav)}

          >

            <Menu size={20} />

          </button>


          <div className="breadcrumbs">

            <span>Workspace</span>

            <b>/</b>

            <strong>{tab}</strong>

          </div>


          <div className="top-actions">

            <span className="status-dot" />

            <span className="live-label">
              Workspace active
            </span>


            <button

              className="icon-btn"

              onClick={loadAll}

              title="Refresh data"

            >

              <RefreshCw size={17} />

            </button>


            <div className="top-avatar">

              {(session.name || 'U')
                .slice(0, 1)
                .toUpperCase()}

            </div>

          </div>

        </header>


        {/* PAGE CONTENT */}

        <div className="page-content">


          {error && (

            <div className="alert-error">

              <span>{error}</span>

              <button onClick={() => setError('')}>

                <X size={16} />

              </button>

            </div>

          )}


          {notice && (

            <div className="toast">

              <Check size={17} />

              {notice}

              <button onClick={() => setNotice('')}>

                <X size={15} />

              </button>

            </div>

          )}


          {/* =====================================================
              OVERVIEW
          ===================================================== */}

          {tab === 'Overview' && (

            <>

              <div className="page-heading">

                <div>

                  <div className="eyebrow">
                    YOUR BUSINESS AT A GLANCE
                  </div>

                  <h1>

                    Good day, {
                      session.name?.split(' ')[0] || 'there'
                    }

                    <span className="wave">✳</span>

                  </h1>

                  <p>
                    Here’s what’s happening with your inventory today.
                  </p>

                </div>


                <button

                  className="btn btn-primary"

                  onClick={() => openProduct()}

                >

                  <Plus size={17} />

                  Add product

                </button>

              </div>


              {/* STATISTICS */}

              <div className="stats-grid">


                <Stat

                  icon={Package}

                  label="Total products"

                  value={summary?.totalProducts ?? '—'}

                  note="Active items in inventory"

                />


                <Stat

                  icon={ShoppingCart}

                  label="Total orders"

                  value={summary?.totalOrders ?? '—'}

                  note="Orders created so far"

                />


                <Stat

                  icon={AlertTriangle}

                  label="Low stock items"

                  value={summary?.lowStockProducts ?? '—'}

                  note="5 units or fewer"

                  warn

                />


                <Stat

                  icon={TrendingUp}

                  label="Total sales"

                  value={money(summary?.totalSales)}

                  note="Completed orders"

                />

              </div>


              {/* DASHBOARD CONTENT */}

              <div className="content-grid">


                <section className="panel">


                  <div className="panel-head">

                    <div>

                      <h3>Recent orders</h3>

                      <p>Your latest customer activity</p>

                    </div>


                    <button

                      className="text-btn"

                      onClick={() => setTab('Orders')}

                    >

                      View all

                      <ArrowUpRight size={15} />

                    </button>

                  </div>


                  <OrderTable

                    orders={orders.slice(0, 5)}

                    onStatus={setOrderStatus}

                  />


                  {orders.length === 0 && (

                    <Empty

                      title="No orders yet"

                      text="Create an order to see activity here."

                    />

                  )}

                </section>


                {/* LOW STOCK */}

                <section className="panel low-panel">


                  <div className="panel-head">

                    <div>

                      <h3>Low stock alert</h3>

                      <p>Items that need attention</p>

                    </div>


                    <span className="pill pill-warning">
                      {lowStock.length} items
                    </span>

                  </div>


                  {lowStock.length === 0 ? (

                    <Empty

                      title="All stocked up"

                      text="No products at or below 5 units."

                    />

                  ) : (

                    <div className="low-list">

                      {lowStock.slice(0, 6).map(p => (

                        <div
                          className="low-item"
                          key={p.id}
                        >

                          <div className="product-mini">

                            {p.name.slice(0, 1).toUpperCase()}

                          </div>


                          <div className="low-info">

                            <b>{p.name}</b>

                            <span>{p.category}</span>

                          </div>


                          <span
                            className={`stock-badge ${
                              p.quantity === 0
                                ? 'stock-zero'
                                : ''
                            }`}
                          >

                            {p.quantity} left

                          </span>

                        </div>

                      ))}

                    </div>

                  )}


                  <button

                    className="btn btn-secondary btn-full"

                    onClick={() => {

                      setTab('Products');

                      setQuery('');

                    }}

                  >

                    Manage inventory

                    <ArrowUpRight size={15} />

                  </button>

                </section>

              </div>


              {/* BOTTOM NOTE */}

              <div className="bottom-note">


                <div className="note-icon">
                  <TrendingUp size={18} />
                </div>


                <div>

                  <b>A clearer view of your business</b>

                  <p>
                    Keep products organized, fulfill orders confidently,
                    and stay ahead of low stock.
                  </p>

                </div>


                <span className="note-tag">
                  STOCKPILOT
                </span>

              </div>

            </>

          )}


          {/* =====================================================
              PRODUCTS
          ===================================================== */}

          {tab === 'Products' && (

            <>

              <div className="page-heading">

                <div>

                  <div className="eyebrow">
                    INVENTORY MANAGEMENT
                  </div>

                  <h1>Products</h1>

                  <p>
                    Manage your catalog, pricing, and available stock.
                  </p>

                </div>


                <button

                  className="btn btn-primary"

                  onClick={() => openProduct()}

                >

                  <Plus size={17} />

                  Add product

                </button>

              </div>


              {/* SEARCH */}

              <div className="toolbar">


                <div className="searchbox">

                  <Search size={17} />

                  <input

                    placeholder="Search products or categories…"

                    value={query}

                    onChange={e => setQuery(e.target.value)}

                  />

                  <kbd>⌘ K</kbd>

                </div>


                <div className="toolbar-count">

                  {filteredProducts.length} products

                </div>

              </div>


              {/* PRODUCT TABLE */}

              <section className="panel table-panel">


                <div className="table-scroll">


                  <table>


                    <thead>

                      <tr>

                        <th>PRODUCT</th>

                        <th>CATEGORY</th>

                        <th>UNIT PRICE</th>

                        <th>AVAILABLE STOCK</th>

                        <th>STATUS</th>

                        <th className="right">ACTIONS</th>

                      </tr>

                    </thead>


                    <tbody>

                      {filteredProducts.map(p => (

                        <tr key={p.id}>


                          <td>

                            <div className="product-cell">


                              <div className="product-icon">

                                {p.name.slice(0, 1).toUpperCase()}

                              </div>


                              <div>

                                <b>{p.name}</b>

                                <span>
                                  SKU-{String(p.id).padStart(4, '0')}
                                </span>

                              </div>

                            </div>

                          </td>


                          <td>

                            <span className="category-text">
                              {p.category}
                            </span>

                          </td>


                          <td className="price-cell">

                            {money(p.price)}

                          </td>


                          <td>

                            <div className="stock-cell">

                              <b>{p.quantity}</b>

                              <div className="stock-track">

                                <span

                                  style={{

                                    width: `${
                                      Math.min(
                                        100,
                                        Math.max(0, p.quantity * 5)
                                      )
                                    }%`

                                  }}

                                />

                              </div>

                            </div>

                          </td>


                          <td>

                            {p.quantity <= 5 ? (

                              <span className="pill pill-warning">

                                {p.quantity === 0
                                  ? 'Out of stock'
                                  : 'Low stock'}

                              </span>

                            ) : (

                              <span className="pill pill-success">
                                In stock
                              </span>

                            )}

                          </td>


                          <td>

                            <div className="row-actions">


                              <button

                                className="icon-btn"

                                title="Adjust stock"

                                onClick={() => changeStock(p)}

                              >

                                <RefreshCw size={15} />

                              </button>


                              <button

                                className="icon-btn"

                                title="Edit product"

                                onClick={() => openProduct(p)}

                              >

                                <Pencil size={15} />

                              </button>


                              <button

                                className="icon-btn danger-hover"

                                title="Remove product"

                                onClick={() => deleteProduct(p)}

                              >

                                <Trash2 size={15} />

                              </button>

                            </div>

                          </td>


                        </tr>

                      ))}

                    </tbody>


                  </table>


                  {filteredProducts.length === 0 && (

                    <Empty

                      title="No products found"

                      text="Add a product or try another search."

                    />

                  )}

                </div>

              </section>

            </>

          )}


          {/* =====================================================
              ORDERS
          ===================================================== */}

          {tab === 'Orders' && (

            <>

              <div className="page-heading">


                <div>

                  <div className="eyebrow">
                    SALES & FULFILMENT
                  </div>

                  <h1>Orders</h1>

                  <p>
                    Track customer orders and keep fulfillment moving.
                  </p>

                </div>


                <button

                  className="btn btn-primary"

                  onClick={() => {

                    setOrderForm({

                      customerName: '',

                      productId: products[0]?.id
                        ? String(products[0].id)
                        : '',

                      quantity: '1'

                    });

                    setModal('order');

                  }}

                >

                  <Plus size={17} />

                  Create order

                </button>

              </div>


              {/* ORDER SUMMARY */}

              <div className="order-summary-strip">


                <div>

                  <span>All orders</span>

                  <b>{orders.length}</b>

                </div>


                <div>

                  <span>Placed</span>

                  <b>
                    {orders.filter(
                      o => o.status === 'PLACED'
                    ).length}
                  </b>

                </div>


                <div>

                  <span>Completed</span>

                  <b>
                    {orders.filter(
                      o => o.status === 'COMPLETED'
                    ).length}
                  </b>

                </div>


                <div>

                  <span>Cancelled</span>

                  <b>
                    {orders.filter(
                      o => o.status === 'CANCELLED'
                    ).length}
                  </b>

                </div>


              </div>


              {/* ORDER TABLE */}

              <section className="panel table-panel">


                <div className="panel-head">

                  <div>

                    <h3>All orders</h3>

                    <p>Order history and current status</p>

                  </div>


                  <span className="pill pill-neutral">
                    {orders.length} records
                  </span>

                </div>


                <OrderTable

                  orders={orders}

                  onStatus={setOrderStatus}

                  detailed

                />


                {orders.length === 0 && (

                  <Empty

                    title="Your order list is empty"

                    text="Create your first order to get started."

                  />

                )}

              </section>

            </>

          )}


          {/* LOADING */}

          {loading && (

            <div className="loading-line">

              <span />

              Updating your workspace…

            </div>

          )}

        </div>

      </main>


      {/* =====================================================
          PRODUCT MODAL
      ===================================================== */}

      {modal === 'product' && (

        <Modal

          title={editing ? 'Edit product' : 'Add a product'}

          subtitle="Product details are used to calculate order totals."

          onClose={() => setModal('')}

        >

          <form

            className="stack-form modal-form"

            onSubmit={saveProduct}

          >


            <label>

              Product name

              <input

                value={productForm.name}

                onChange={e =>
                  setProductForm({
                    ...productForm,
                    name: e.target.value
                  })
                }

                required

                maxLength="120"

                placeholder="e.g. Wireless mouse"

              />

            </label>


            <label>

              Category

              <input

                value={productForm.category}

                onChange={e =>
                  setProductForm({
                    ...productForm,
                    category: e.target.value
                  })
                }

                required

                maxLength="80"

                placeholder="e.g. Electronics"

              />

            </label>


            <div className="form-row">


              <label>

                Unit price (₹)

                <input

                  type="number"

                  min="0.01"

                  step="0.01"

                  value={productForm.price}

                  onChange={e =>
                    setProductForm({
                      ...productForm,
                      price: e.target.value
                    })
                  }

                  required

                />

              </label>


              <label>

                Quantity

                <input

                  type="number"

                  min="0"

                  step="1"

                  value={productForm.quantity}

                  onChange={e =>
                    setProductForm({
                      ...productForm,
                      quantity: e.target.value
                    })
                  }

                  required

                />

              </label>


            </div>


            <div className="modal-actions">


              <button

                type="button"

                className="btn btn-secondary"

                onClick={() => setModal('')}

              >

                Cancel

              </button>


              <button className="btn btn-primary">

                {editing
                  ? 'Save changes'
                  : 'Add product'}

              </button>


            </div>


          </form>

        </Modal>

      )}


      {/* =====================================================
          ORDER MODAL
      ===================================================== */}

      {modal === 'order' && (

        <Modal

          title="Create an order"

          subtitle="Stock will be checked and deducted automatically."

          onClose={() => setModal('')}

        >

          <form

            className="stack-form modal-form"

            onSubmit={createOrder}

          >


            <label>

              Customer name

              <input

                value={orderForm.customerName}

                onChange={e =>
                  setOrderForm({
                    ...orderForm,
                    customerName: e.target.value
                  })
                }

                required

                maxLength="120"

                placeholder="Customer or business name"

              />

            </label>


            <label>

              Product

              <select

                value={orderForm.productId}

                onChange={e =>
                  setOrderForm({
                    ...orderForm,
                    productId: e.target.value
                  })
                }

                required

              >

                <option value="">
                  Select a product
                </option>


                {products

                  .filter(p => p.quantity > 0)

                  .map(p => (

                    <option
                      key={p.id}
                      value={p.id}
                    >

                      {p.name} — {money(p.price)}
                      ({p.quantity} available)

                    </option>

                  ))}

              </select>

            </label>


            <label>

              Quantity

              <input

                type="number"

                min="1"

                step="1"

                value={orderForm.quantity}

                onChange={e =>
                  setOrderForm({
                    ...orderForm,
                    quantity: e.target.value
                  })
                }

                required

              />

            </label>


            {orderForm.productId && (

              <div className="order-total-preview">

                <span>Estimated total</span>

                <b>

                  {money(

                    (
                      products.find(
                        p =>
                          p.id === Number(orderForm.productId)
                      )?.price || 0
                    ) * Number(orderForm.quantity || 0)

                  )}

                </b>

              </div>

            )}


            <div className="modal-actions">


              <button

                type="button"

                className="btn btn-secondary"

                onClick={() => setModal('')}

              >

                Cancel

              </button>


              <button

                className="btn btn-primary"

                disabled={!products.some(p => p.quantity > 0)}

              >

                Create order

              </button>


            </div>


          </form>

        </Modal>

      )}


    </div>

  );

}


/* =====================================================
   STAT CARD
===================================================== */

function Stat({
  icon: Icon,
  label,
  value,
  note,
  warn
}) {

  return (

    <div className="stat-card">


      <div
        className={`stat-icon ${
          warn ? 'stat-icon-warn' : ''
        }`}
      >

        <Icon size={19} />

      </div>


      <div className="stat-label">
        {label}
      </div>


      <div className="stat-value">
        {value}
      </div>


      <div className="stat-note">
        {note}
      </div>


      <div className="stat-decoration" />


    </div>

  );

}


/* =====================================================
   ORDER TABLE
===================================================== */

function OrderTable({
  orders,
  onStatus,
  detailed = false
}) {

  return (

    <div className="table-scroll">


      <table>


        <thead>

          <tr>

            <th>ORDER</th>

            <th>CUSTOMER</th>

            <th>DATE</th>

            <th>AMOUNT</th>

            <th>STATUS</th>

            <th className="right">ACTIONS</th>

          </tr>

        </thead>


        <tbody>


          {orders.map(o => (

            <tr key={o.orderId}>


              <td>

                <b className="order-id">

                  #{String(o.orderId).padStart(4, '0')}

                </b>


                {detailed && (

                  <span className="sub-cell">

                    {o.items?.length || 0} line item(s)

                  </span>

                )}

              </td>


              <td>

                <div className="customer-cell">


                  <div className="customer-avatar">

                    {(o.customerName || '?')
                      .slice(0, 1)
                      .toUpperCase()}

                  </div>


                  <b>{o.customerName}</b>


                </div>

              </td>


              <td className="date-cell">

                {date(o.createdAt)}

              </td>


              <td className="price-cell">

                {money(o.totalAmount)}

              </td>


              <td>

                <span

                  className={`pill ${
                    o.status === 'COMPLETED'
                      ? 'pill-success'
                      : o.status === 'CANCELLED'
                        ? 'pill-danger'
                        : 'pill-blue'
                  }`}

                >

                  {o.status?.toLowerCase()}

                </span>

              </td>


              <td>

                <div className="row-actions">


                  {o.status === 'PLACED' && (

                    <>


                      <button

                        className="small-action"

                        onClick={() =>
                          onStatus(o, 'COMPLETED')
                        }

                        title="Complete order"

                      >

                        <Check size={14} />

                        Complete

                      </button>


                      <button

                        className="icon-btn danger-hover"

                        onClick={() => {

                          if (
                            confirm(`Cancel order #${o.orderId}?`)
                          ) {

                            onStatus(o, 'CANCELLED');

                          }

                        }}

                        title="Cancel order"

                      >

                        <X size={15} />

                      </button>


                    </>

                  )}


                </div>

              </td>


            </tr>

          ))}


        </tbody>


      </table>


    </div>

  );

}


/* =====================================================
   EMPTY STATE
===================================================== */

function Empty({ title, text }) {

  return (

    <div className="empty-state">


      <div className="empty-icon">

        <Package size={22} />

      </div>


      <b>{title}</b>


      <p>{text}</p>


    </div>

  );

}


/* =====================================================
   MODAL
===================================================== */

function Modal({
  title,
  subtitle,
  onClose,
  children
}) {

  return (

    <div

      className="modal-backdrop"

      onMouseDown={e => {

        if (e.target === e.currentTarget) {
          onClose();
        }

      }}

    >


      <div className="modal">


        <div className="modal-head">


          <div>

            <h3>{title}</h3>

            <p>{subtitle}</p>

          </div>


          <button

            className="icon-btn"

            onClick={onClose}

          >

            <X size={18} />

          </button>


        </div>


        {children}


      </div>


    </div>

  );

}


/* =====================================================
   APPLICATION ENTRY POINT
===================================================== */

createRoot(
  document.getElementById('root')
).render(
  <App />
);