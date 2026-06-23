import React, { useState, useEffect } from 'react';
import {
  Menu, User, ShoppingBag, Plus, Search, ChevronRight, X, Camera, Image,
  ArrowLeft, Check, AlertCircle, ShoppingCart, Info, Phone, MessageSquare,
  Lock, ArrowRight, Star, MapPin, Clock, Truck, Package, Home, Zap,
  PillBottle, Thermometer, Heart, Shield, Activity, FileText
} from 'lucide-react';
import {
  loadState, saveState,
  INITIAL_PRODUCTS, INITIAL_STORES, INITIAL_DEPENDENTS,
  CLICKSGO_OTC_PRODUCTS, CLICKSGO_SCRIPT_PRODUCTS, CLICKSGO_PHARMACY
} from './data/db';

// ─── LOGO COMPONENT ───────────────────────────────────────────────
function ClicksGoLogo({ size = 'md' }) {
  const cls = size === 'lg' ? 'clicksgo-logo clicksgo-logo--lg' : 'clicksgo-logo';
  return (
    <div className={cls}>
      <span className="clicksgo-logo__clicks">Clicks</span>
      <span className="clicksgo-logo__plus">+</span>
      <span className="clicksgo-logo__go"> | ClicksGo</span>
    </div>
  );
}

function ClicksGoLogoSimple({ size = 'md' }) {
  const cls = size === 'lg' ? 'clicksgo-logo clicksgo-logo--lg' : 'clicksgo-logo';
  return (
    <div className={cls}>
      <span className="clicksgo-logo__clicks" style={{ fontStyle: 'italic', fontWeight: 900 }}>Clicks</span>
      <span className="clicksgo-logo__go" style={{ fontStyle: 'italic', fontWeight: 900 }}>Go</span>
    </div>
  );
}

// Category icon mapping
const categoryIcons = {
  'Pain Relief': <Activity size={16} />,
  'Cough & Cold': <Thermometer size={16} />,
  'Vitamins': <Heart size={16} />,
  'Skin Care': <Shield size={16} />,
  'First Aid': <Plus size={16} />,
};

export default function App() {
  const [db, setDb] = useState(loadState());
  const [activeTab, setActiveTab] = useState('MyClicks');
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentFlow, setCurrentFlow] = useState('clicksgo');
  const [currentScreen, setCurrentScreen] = useState('clicksgo_home');

  // Login state
  const [loginEmail, setLoginEmail] = useState('adityatest36@gmail.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // start logged in for demo
  const [isBiometricsPopup, setIsBiometricsPopup] = useState(false);

  // ClicksGo flow state
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [activeShopTab, setActiveShopTab] = useState('OTC Items'); // OTC Items / Doctor's script / Repeat Order
  const [selectedCategory, setSelectedCategory] = useState('Pain Relief');
  const [cartItems, setCartItems] = useState([]);
  const [scriptCartItems, setScriptCartItems] = useState([]);
  // Uploaded scripts stored as simple labelled entries
  const [uploadedScripts, setUploadedScripts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('clicksgo_uploaded_scripts') || '[]'); }
    catch { return []; }
  });
  const [successOrder, setSuccessOrder] = useState(null);
  const [locationOverlay, setLocationOverlay] = useState(false);
  const [deliveryType, setDeliveryType] = useState('Delivery');
  const [selectedStore, setSelectedStore] = useState(INITIAL_STORES[0]);
  const [selectedRecipient, setSelectedRecipient] = useState(INITIAL_DEPENDENTS[0]);

  // Repeat Order state
  const REPEAT_SCRIPTS = [
    { id: 'r1', name: 'GLUCONORM 500MG TAB (100)', patient: 'C***a', doctor: 'DE KLERK', nextRefill: '17-6-2026', refillsLeft: 5, totalRefills: 5, price: 95.00 },
    { id: 'r2', name: 'EUTHYROX 100MCG TAB (30)', patient: 'C***a', doctor: 'SAULS', nextRefill: '17-6-2026', refillsLeft: 5, totalRefills: 5, price: 65.00 },
    { id: 'r3', name: 'VIMOVO 500/20MG TAB (60)', patient: 'C***a', doctor: 'ISAACS', nextRefill: '20-6-2026', refillsLeft: 3, totalRefills: 5, price: 145.00 },
    { id: 'r4', name: 'ZELARY 10MG TAB (30)', patient: 'C***a', doctor: 'BELL-ARMSTRONG', nextRefill: '20-6-2026', refillsLeft: 5, totalRefills: 5, price: 115.00 },
  ];
  const [selectedRefills, setSelectedRefills] = useState(() => {
    try { return JSON.parse(localStorage.getItem('clicksgo_selected_refills') || '[]'); }
    catch { return []; }
  });
  const [repeatView, setRepeatView] = useState('list'); // 'list' | 'order' | 'medical_aid'
  const [autoRefills, setAutoRefills] = useState(false);
  const [acceptGenericSub, setAcceptGenericSub] = useState(false);
  const [pharmacistNote, setPharmacistNote] = useState('');
  const [instructionsSheetOpen, setInstructionsSheetOpen] = useState(false);
  const [repeatMedicalAidChoice, setRepeatMedicalAidChoice] = useState(null);

  const toggleRefill = (id) => {
    setSelectedRefills(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('clicksgo_selected_refills', JSON.stringify(next));
      return next;
    });
  };

  // Script state
  const [isScriptPopup, setIsScriptPopup] = useState(false);
  const [uploadOptionOpen, setUploadOptionOpen] = useState(false);
  const [photoPermissionOpen, setPhotoPermissionOpen] = useState(false);
  const [photoLibraryOpen, setPhotoLibraryOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedScriptImage, setUploadedScriptImage] = useState(null);
  const [scriptInfo, setScriptInfo] = useState({ acceptGeneric: 'Yes', allergies: '', instructions: '', processRepeats: 'Yes' });
  const [isGenericTooltip, setIsGenericTooltip] = useState(false);

  // OTC questionnaire
  const [otcQuestionIndex, setOtcQuestionIndex] = useState(0);
  const [otcAnswers, setOtcAnswers] = useState({ q1: 'No', q2: 'Yes', q2Text: '', q3: 'Yes', q3Text: '', q4: 'No', q5: '' });
  const [claimMedicalAid, setClaimMedicalAid] = useState(null);
  const [paymentOption, setPaymentOption] = useState('Prepay with SMS payment link');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSignedOutPopup, setIsSignedOutPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [medicalAidScheme, setMedicalAidScheme] = useState('');
  const [medicalAidDepCode, setMedicalAidDepCode] = useState('');
  const [medicalAidMemberNum, setMedicalAidMemberNum] = useState('');

  // Local state for ClicksGo questionnaires
  const [otcQ1, setOtcQ1] = useState(null);
  const [otcQ2, setOtcQ2] = useState(null);
  const [otcQ2Text, setOtcQ2Text] = useState('');
  const [otcQ3, setOtcQ3] = useState(null);

  const [scriptAcceptGeneric, setScriptAcceptGeneric] = useState(null);
  const [scriptAllergies, setScriptAllergies] = useState('');
  const [scriptInstructions, setScriptInstructions] = useState('');
  const [scriptAutoRefills, setScriptAutoRefills] = useState(null);

  useEffect(() => {
    saveState(db);
    setCartItems(db.cart || []);
  }, [db]);

  const updateDbState = (updates) => {
    setDb(prev => {
      const newState = { ...prev, ...updates };
      saveState(newState);
      return newState;
    });
  };

  const handleAddToCart = (product) => {
    const updatedCart = [...cartItems];
    const existing = updatedCart.find(i => i.id === product.id);
    if (existing) { existing.quantity += 1; }
    else { updatedCart.push({ ...product, quantity: 1 }); }
    setCartItems(updatedCart);
    updateDbState({ cart: updatedCart });
  };

  const handleRemoveFromCart = (productId) => {
    const updated = cartItems.filter(i => i.id !== productId);
    setCartItems(updated);
    updateDbState({ cart: updated });
  };

  const handleUpdateQuantity = (productId, amount) => {
    const updated = cartItems.map(i => {
      if (i.id === productId) {
        const newQty = i.quantity + amount;
        return newQty <= 0 ? null : { ...i, quantity: newQty };
      }
      return i;
    }).filter(Boolean);
    setCartItems(updated);
    updateDbState({ cart: updated });
  };

  const getCartQty = (id) => {
    const item = cartItems.find(i => i.id === id);
    return item ? item.quantity : 0;
  };

  const totalCartItems = cartItems.reduce((a, i) => a + i.quantity, 0)
    + uploadedScripts.length + selectedRefills.length;

  // Demo navigation
  const runDemoFlow = (flowName) => {
    setIsDemoOpen(false);
    setIsDrawerOpen(false);
    setLocationOverlay(false);
    setIsScriptPopup(false);
    setUploadOptionOpen(false);
    setPhotoPermissionOpen(false);
    setPhotoLibraryOpen(false);
    setIsGenericTooltip(false);
    setSuccessOrder(null);
    setCurrentFlow(flowName);

    if (flowName === 'clicksgo') {
      setActiveTab('MyClicks');
      setCurrentScreen('clicksgo_home');
    } else if (flowName === 'login') {
      setIsLoggedIn(false);
      setCurrentScreen('login_email');
    } else if (flowName === 'clicksgo_address') {
      setCurrentScreen('clicksgo_address');
    } else if (flowName === 'clicksgo_pharmacy') {
      setCurrentScreen('clicksgo_pharmacy');
    } else if (flowName === 'clicksgo_shop') {
      setActiveShopTab('OTC Items');
      setCurrentScreen('clicksgo_shop');
    } else if (flowName === 'clicksgo_review') {
      if (cartItems.length === 0) {
        setCartItems([
          { ...CLICKSGO_OTC_PRODUCTS[0], quantity: 1 },
          { ...CLICKSGO_OTC_PRODUCTS[1], quantity: 2 },
        ]);
      }
      setCurrentScreen('clicksgo_review');
    } else if (flowName === 'clicksgo_confirm') {
      setCurrentScreen('clicksgo_confirm');
    } else if (flowName === 'clicksgo_recipient') {
      setCurrentScreen('clicksgo_recipient');
    } else if (flowName === 'clicksgo_questionnaire_otc') {
      setCurrentScreen('clicksgo_questionnaire_otc');
    } else if (flowName === 'clicksgo_questionnaire_script') {
      setCurrentScreen('clicksgo_questionnaire_script');
    } else if (flowName === 'clicksgo_track') {
      setCurrentScreen('clicksgo_track');
    } else if (flowName === 'home') {
      setActiveTab('MyClicks');
      setCurrentScreen('home_dashboard');
    }
  };

  // Script upload
  const startScriptUpload = () => { setUploadOptionOpen(false); setPhotoPermissionOpen(true); };
  const confirmPhotoPermission = () => { setPhotoPermissionOpen(false); setPhotoLibraryOpen(true); };
  const selectPhotoFromLibrary = () => {
    setPhotoLibraryOpen(false);
    setIsUploading(true);
    setUploadProgress(0);
    const iv = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(iv);
          setIsUploading(false);
          setUploadedScripts(prev => {
            const next = [...prev, {
              id: Date.now(),
              label: `Script ${prev.length + 1}`,
              uploadedAt: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
            }];
            localStorage.setItem('clicksgo_uploaded_scripts', JSON.stringify(next));
            return next;
          });
          setCurrentScreen('clicksgo_shop');
          setActiveShopTab("Doctor's script");
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleRemoveScript = (scriptId) => {
    setUploadedScripts(prev => {
      // Re-number remaining scripts after removal
      const next = prev
        .filter(s => s.id !== scriptId)
        .map((s, i) => ({ ...s, label: `Script ${i + 1}` }));
      localStorage.setItem('clicksgo_uploaded_scripts', JSON.stringify(next));
      return next;
    });
  };

  const handleOrderSubmission = () => {
    const otcTotal = cartItems.reduce((a, i) => a + i.price * i.quantity, 0);
    
    const repeatOrderItems = REPEAT_SCRIPTS.filter(s => selectedRefills.includes(s.id));
    const repeatTotal = repeatOrderItems.reduce((a, s) => a + s.price, 0);

    const subtotal = otcTotal + repeatTotal;
    const deliveryFee = 15.00;
    const total = subtotal + deliveryFee;

    const newOrder = {
      id: 'CG' + Math.floor(10000000 + Math.random() * 90000000),
      date: new Date().toLocaleDateString('en-GB').split('/').join(' '),
      store: CLICKSGO_PHARMACY.name,
      type: 'ClicksGo',
      status: 'Order Placed',
      estimatedDelivery: 'Within 2 hours',
      total: total,
      products: [
        ...cartItems.map(item => ({ ...item })),
        ...repeatOrderItems.map(item => ({ id: item.id, name: item.name, subtext: `Refill for ${item.patient}`, price: item.price, quantity: 1 })),
        ...uploadedScripts.map((item, idx) => {
          return { id: item.id, name: item.label, subtext: 'From uploaded script', price: 0, quantity: 1 };
        })
      ],
      scriptProducts: []
    };

    const updatedOrders = [newOrder, ...db.orders];
    updateDbState({ orders: updatedOrders, cart: [] });

    setCartItems([]);
    setScriptCartItems([]);
    setUploadedScripts([]);
    setSelectedRefills([]);
    localStorage.removeItem('clicksgo_uploaded_scripts');
    localStorage.removeItem('clicksgo_selected_refills');

    setSuccessOrder(newOrder);
    setCurrentScreen('clicksgo_recipient');
  };

  const handleBackNavigation = () => {
    const hasOtc = successOrder?.products.some(p => !p.subtext?.includes('script') && !p.subtext?.includes('Refill')) || false;
    const backMap = {
      clicksgo_address: 'clicksgo_home',
      clicksgo_pharmacy: 'clicksgo_address',
      clicksgo_shop: 'clicksgo_pharmacy',
      clicksgo_review: 'clicksgo_shop',
      clicksgo_confirm: 'clicksgo_review',
      clicksgo_recipient: 'clicksgo_confirm',
      clicksgo_questionnaire_otc: 'clicksgo_recipient',
      clicksgo_questionnaire_script: hasOtc ? 'clicksgo_questionnaire_otc' : 'clicksgo_recipient',
      clicksgo_track: 'clicksgo_home',
      home_dashboard: 'clicksgo_home',
      order_history: 'home_dashboard',
      order_details: 'order_history',
      product_details: 'clicksgo_shop',
      my_account: 'home_dashboard',
    };
    setCurrentScreen(backMap[currentScreen] || 'clicksgo_home');
  };

  // ─── TOP BAR ──────────────────────────────────────────────────────────
  function renderHeader() {
    if (currentScreen === 'login_email' || currentScreen === 'login_password') return null;
    if (currentScreen === 'payu_form' || currentScreen === 'payment_cancelled') return null;
    if (currentScreen === 'clicksgo_questionnaire_otc' || currentScreen === 'clicksgo_questionnaire_script') return null;
    if (currentScreen === 'clicksgo_recipient') {
      return (
        <div className="app-bar" style={{ borderBottom: 'none', background: '#fff', paddingBottom: 0 }}>
          <div className="app-bar__left">
            <button className="app-bar__icon-btn" onClick={handleBackNavigation}>
              <ArrowLeft size={20} color="var(--navy)" />
            </button>
          </div>
        </div>
      );
    }

    const isMainScreen = ['clicksgo_home', 'home_dashboard', 'pharmacy_landing', 'shop_landing', 'cart_view'].includes(currentScreen);

    let leftBtn = null;
    if (isMainScreen) {
      leftBtn = (
        <button className="app-bar__icon-btn" onClick={() => setIsDrawerOpen(true)}>
          <Menu size={20} color="var(--navy)" />
        </button>
      );
    } else {
      leftBtn = (
        <button className="app-bar__icon-btn" onClick={handleBackNavigation}>
          <ArrowLeft size={20} color="var(--navy)" />
        </button>
      );
    }

    // Screen-specific right side
    const isClicksGoFlow = currentScreen.startsWith('clicksgo_');

    return (
      <div className="app-bar">
        <div className="app-bar__left">
          {leftBtn}
          {isClicksGoFlow
            ? <ClicksGoLogoSimple />
            : <ClicksGoLogo />
          }
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {isLoggedIn && (
            <>
              <div style={{ position: 'relative', cursor: 'pointer' }}
                onClick={() => { setActiveTab('Cart'); setCurrentScreen('clicksgo_review'); }}>
                <ShoppingCart size={20} color="var(--navy)" />
                {totalCartItems > 0 && (
                  <span className="cart-badge-count" style={{ top: -6, right: -8 }}>{totalCartItems}</span>
                )}
              </div>
              <div onClick={() => setCurrentScreen('my_account')}
                style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), var(--navy))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                {db.user.avatar}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── BOTTOM NAV ───────────────────────────────────────────────────────
  function renderBottomNav() {
    if (['login_email', 'login_password', 'payu_form', 'payment_cancelled', 'clicksgo_recipient', 'clicksgo_questionnaire_otc', 'clicksgo_questionnaire_script'].includes(currentScreen)) return null;

    const tabs = [
      { id: 'MyClicks', label: 'MyClicks', icon: <User />, screen: 'clicksgo_home' },
      { id: 'Shop', label: 'Shop', icon: <Search />, screen: 'clicksgo_shop' },
      { id: 'ClubCard', label: 'ClubCard', icon: <ShoppingBag />, screen: 'clubcard_view' },
      { id: 'Pharmacy', label: 'Pharmacy', icon: <Plus />, screen: 'pharmacy_landing' },
      { id: 'Cart', label: 'Cart', icon: (
        <div className="cart-badge">
          <ShoppingCart />
          {totalCartItems > 0 && <span className="cart-badge-count">{totalCartItems}</span>}
        </div>
      ), screen: 'clicksgo_review' }
    ];

    return (
      <div className="bottom-nav-bar">
        {tabs.map(t => (
          <button key={t.id}
            className={`nav-tab-button ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => { setActiveTab(t.id); setCurrentScreen(t.screen); }}>
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    );
  }

  // ─── SCREEN ROUTER ─────────────────────────────────────────────────────
  function renderActiveScreen() {
    if (!isLoggedIn) return renderLoginFlow();

    const screenMap = {
      clicksgo_home: renderClicksGoHome,
      clicksgo_address: renderClicksGoAddress,
      clicksgo_pharmacy: renderClicksGoPharmacy,
      clicksgo_shop: renderClicksGoShop,
      clicksgo_review: renderClicksGoReview,
      clicksgo_confirm: renderClicksGoConfirm,
      clicksgo_recipient: renderClicksGoRecipient,
      clicksgo_questionnaire_otc: renderClicksGoQuestionnaireOtc,
      clicksgo_questionnaire_script: renderClicksGoQuestionnaireScript,
      clicksgo_track: renderClicksGoTrack,
      home_dashboard: renderHomeDashboard,
      my_account: renderMyAccountScreen,
      order_history: renderOrderHistoryScreen,
      order_details: renderOrderDetailsScreen,
      product_details: renderProductDetailsScreen,
      pharmacy_landing: renderPharmacyLanding,
      clubcard_view: renderClubCardView,
    };

    const fn = screenMap[currentScreen];
    return fn ? fn() : renderClicksGoHome();
  }

  // ══════════════════════════════════════════════════════════════════
  // SCREEN 0: ClicksGo Home (MyClicks home – the entry point)
  // ══════════════════════════════════════════════════════════════════
  function renderClicksGoHome() {
    return (
      <div className="screen-root" style={{ gap: 14, paddingBottom: 24 }}>

        {/* Welcome card */}
        <div className="card" style={{ padding: 16 }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block' }}>Welcome back,</span>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy)', marginTop: 2 }}>{db.user.fullName || db.user.name}</h2>
        </div>

        {/* ClicksGo hero banner */}
        <div
          onClick={() => { setCurrentFlow('clicksgo'); setCurrentScreen('clicksgo_address'); }}
          style={{
            background: 'linear-gradient(135deg, #002B5C 0%, #0057B8 60%, #1A73E8 100%)',
            borderRadius: 16,
            padding: '18px 16px',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 6px 24px rgba(0,87,184,.35)'
          }}
        >
          {/* Decorative circle */}
          <div style={{ position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
          <div style={{ position: 'absolute', right: 20, bottom: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ color: '#fff', fontWeight: 900, fontStyle: 'italic', fontSize: 22, letterSpacing: '-0.02em' }}>Clicks</span>
              <span style={{ color: '#3DB54A', fontWeight: 900, fontStyle: 'italic', fontSize: 22 }}>Go</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,.85)', fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
              Pharmacy Quick Commerce
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 20, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} color="#fff" />
                <span style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>2-hour delivery</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 20, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Zap size={12} color="#FCD34D" />
                <span style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>In-stock only</span>
              </div>
            </div>
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>Start quick order</span>
              <ArrowRight size={16} color="#fff" />
            </div>
          </div>
        </div>

        {/* Quick shortcuts */}
        <div>
          <div className="section-header">
            <h3>My shortcuts</h3>
            <span className="section-header__link">Edit</span>
          </div>
          <div className="shortcut-grid">
            <div className="shortcut-card" onClick={() => setCurrentScreen('clicksgo_address')}>
              <div className="shortcut-card__icon">
                <Zap size={20} color="var(--blue)" />
              </div>
              <span className="shortcut-card__label">ClicksGo</span>
            </div>
            <div className="shortcut-card" onClick={() => { setIsScriptPopup(false); setUploadOptionOpen(true); }}>
              <div className="shortcut-card__icon">
                <FileText size={20} color="var(--blue)" />
              </div>
              <span className="shortcut-card__label">Prescriptions</span>
            </div>
            <div className="shortcut-card" onClick={() => { setActiveTab('ClubCard'); setCurrentScreen('clubcard_view'); }}>
              <div className="shortcut-card__icon">
                <ShoppingBag size={20} color="var(--blue)" />
              </div>
              <span className="shortcut-card__label">ClubCard</span>
            </div>
            <div className="shortcut-card">
              <div className="shortcut-card__icon"><Activity size={20} color="var(--blue)" /></div>
              <span className="shortcut-card__label">My bookings</span>
            </div>
            <div className="shortcut-card" onClick={() => { setUploadOptionOpen(true); }}>
              <div className="shortcut-card__icon"><Plus size={20} color="var(--blue)" /></div>
              <span className="shortcut-card__label">My scripts</span>
            </div>
            <div className="shortcut-card" onClick={() => setCurrentScreen('order_history')}>
              <div className="shortcut-card__icon"><Package size={20} color="var(--blue)" /></div>
              <span className="shortcut-card__label">My orders</span>
            </div>
          </div>
        </div>

        {/* ClicksGo info strip */}
        <div style={{ background: 'var(--blue-bg)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid rgba(0,87,184,.15)' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Truck size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>ClicksGo</div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 1 }}>Pharmacy delivery in as little as 2 hours</div>
          </div>
        </div>

      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // SCREEN 1: ClicksGo – Confirm Delivery Address
  // ══════════════════════════════════════════════════════════════════
  function renderClicksGoAddress() {
    const addresses = db.user.addresses;
    const chosen = selectedAddress || addresses[0];

    return (
      <div className="screen-root" style={{ gap: 14, paddingBottom: 24 }}>

        {/* Step header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div className="step-pill__circle step-pill__circle--done">✓</div>
          <div className="step-pill__circle step-pill__circle--active" style={{ marginLeft: 4 }}>2</div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>Confirm your delivery address</span>
        </div>

        <div className="card" style={{ padding: 16, gap: 4, display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>Confirm your delivery address</h2>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>We'll use this to find your closest Clicks Pharmacy</p>
        </div>

        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Deliver to</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {addresses.map(addr => (
              <div
                key={addr.id}
                className={`address-row ${chosen?.id === addr.id ? 'selected' : ''}`}
                onClick={() => setSelectedAddress(addr)}
              >
                <div className="address-row__icon">
                  <Home size={16} color="var(--blue)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="address-row__label">{addr.label}</div>
                  <div className="address-row__sub">{addr.line1}<br />{addr.line2}</div>
                </div>
                <ChevronRight size={16} color="var(--text-3)" />
              </div>
            ))}

            <button style={{ border: 'none', background: 'none', padding: '8px 4px', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--blue)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              <MapPin size={16} />
              Use a different address
            </button>
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={() => setCurrentScreen('clicksgo_pharmacy')}
          style={{ marginTop: 8 }}
        >
          Confirm address
        </button>

        {/* Delivery info */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: 'var(--green-bg)', borderRadius: 10, border: '1px solid rgba(61,181,74,.2)' }}>
          <Zap size={16} color="var(--green)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)' }}>Express Delivery (2 hours)</span>
            <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>Up to 2 hours · Delivery fee: Rxx</div>
          </div>
        </div>

      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // SCREEN 2: ClicksGo – Closest Pharmacy
  // ══════════════════════════════════════════════════════════════════
  function renderClicksGoPharmacy() {
    const ph = CLICKSGO_PHARMACY;
    return (
      <div className="screen-root" style={{ gap: 14, paddingBottom: 24 }}>

        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>Closest pharmacy</h2>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Based on your delivery address</p>
        </div>

        {/* Pharmacy card */}
        <div className="card card--elevated" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)' }}>{ph.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4, whiteSpace: 'pre-line' }}>{ph.address}</div>
            </div>
            <span className="chip chip--green" style={{ flexShrink: 0 }}>{ph.distance}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-2)' }}>
              <Clock size={14} color="var(--blue)" />
              {ph.deliveryTime}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-2)' }}>
              <Truck size={14} color="var(--blue)" />
              Delivery fee: {ph.deliveryFee}
            </div>
          </div>
          <button style={{ border: 'none', background: 'none', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <MapPin size={14} />
            Change delivery address
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Map illustration */}
        <div className="pharmacy-map">
          <div style={{ position: 'absolute', right: 8, bottom: 8 }} className="pharmacy-map__trees">
            <div className="pharmacy-map__tree" />
            <div className="pharmacy-map__tree" style={{ height: 24, marginTop: 8 }} />
          </div>
          <div className="pharmacy-map__distance-tag">{ph.distance}</div>
          <div className="pharmacy-map__store-icon">
            <div className="pharmacy-map__building" style={{ position: 'relative' }}>
              <div className="pharmacy-map__building-windows">
                <div className="pharmacy-map__window lit" />
                <div className="pharmacy-map__window lit" />
                <div className="pharmacy-map__window" />
                <div className="pharmacy-map__window" />
              </div>
              <div className="pharmacy-map__door" />
              {/* pin */}
              <div style={{ position: 'absolute', top: -12, right: -12, background: 'var(--red)', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={11} color="#fff" />
              </div>
            </div>
          </div>
        </div>

        {/* Delivery summary */}
        <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MapPin size={14} color="var(--blue)" />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-1)' }}>Store</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{ph.name}, {ph.addressShort}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Truck size={14} color="var(--blue)" />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-1)' }}>Delivery</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)' }}>Express (2 hours) · Delivery fee: Rxx</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Activity size={14} color="var(--blue)" />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-1)' }}>Distance</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{ph.distance}</div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Info size={12} />
          We show products in stock at this store only
        </div>

        <button className="btn-primary" onClick={() => { setActiveShopTab('OTC Items'); setCurrentScreen('clicksgo_shop'); }}>
          Next
        </button>

      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // SCREEN 3: ClicksGo – Shop (OTC + Doctor's script tabs)
  // ══════════════════════════════════════════════════════════════════
  function renderClicksGoShop() {
    const ph = CLICKSGO_PHARMACY;
    const categories = ['Pain Relief', "Cough & Cold", 'Vitamins', 'Skin Care', 'First Aid'];

    const otcProducts = CLICKSGO_OTC_PRODUCTS.filter(p =>
      selectedCategory === 'All' || p.category === selectedCategory
    );

    return (
      <div className="screen-root--flush">

        {/* Delivery address bar */}
        <div style={{ background: 'var(--white)', padding: '8px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
            Deliver to: <strong style={{ color: 'var(--navy)' }}>21, Park Street, Bengaluru ∨</strong>
          </div>
          <ShoppingCart size={18} color="var(--navy)"
            onClick={() => setCurrentScreen('clicksgo_review')}
            style={{ cursor: 'pointer' }} />
        </div>

        {/* Search bar */}
        <div style={{ padding: '8px 16px', background: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', padding: '7px 12px', gap: 8 }}>
            <Search size={16} color="var(--text-3)" />
            <input type="text" placeholder="Search medicines, health products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: 12, background: 'transparent', width: '100%', color: 'var(--text-1)' }} />
          </div>
        </div>

        {/* OTC / Doctor's script / Repeat Order tabs */}
        <div style={{ background: 'var(--white)', padding: '0 16px', borderBottom: '1px solid var(--border)' }}>
          <div className="tab-switcher">
            {['OTC Items', "Doctor's script", 'Repeat Order'].map(tab => (
              <button key={tab}
                className={`tab-switcher__tab ${activeShopTab === tab ? 'active' : ''}`}
                onClick={() => { setActiveShopTab(tab); if (tab === 'Repeat Order') setRepeatView('list'); }}
                style={{ fontSize: tab === 'Repeat Order' ? 11 : 13 }}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeShopTab === 'OTC Items' && (
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>



            {/* In-stock notice */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: 'var(--green-bg)', borderRadius: 6, border: '1px solid rgba(61,181,74,.2)' }}>
              <Check size={12} color="var(--green)" />
              <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>Only in-stock items shown at this store</span>
            </div>

            {/* Sort/Filter row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>
                All OTC Items ({otcProducts.length} in stock)
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600, cursor: 'pointer' }}>Sort</span>
                <span style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600, cursor: 'pointer' }}>Filter</span>
              </div>
            </div>

            {/* Product list */}
            <div className="card" style={{ padding: '0 14px' }}>
              {otcProducts.map(prod => {
                const qty = getCartQty(prod.id);
                return (
                  <div key={prod.id} className="product-row">
                    <div style={{
                      width: 48, height: 48, borderRadius: 8, background: 'var(--bg)',
                      border: '1px solid var(--border)', flexShrink: 0, display: 'flex',
                      alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Activity size={20} color="var(--blue)" />
                    </div>
                    <div className="product-row__info">
                      <span className="product-row__name">{prod.name}</span>
                      <span className="product-row__sub">{prod.subtext}</span>
                      <span className="product-row__price">R{prod.price.toFixed(2)}</span>
                      <span className="product-row__stock">In Stock</span>
                    </div>
                    {qty === 0 ? (
                      <button onClick={() => handleAddToCart(prod)}
                        style={{ background: 'var(--blue-bg)', color: 'var(--blue)', border: '1.5px solid var(--blue)', borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        + Add
                      </button>
                    ) : (
                      <div className="qty-control">
                        <button className="qty-control__btn" onClick={() => handleUpdateQuantity(prod.id, -1)}>−</button>
                        <span className="qty-control__val">{qty}</span>
                        <button className="qty-control__btn" onClick={() => handleUpdateQuantity(prod.id, 1)}>+</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeShopTab === "Doctor's script" && (
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {uploadedScripts.length === 0 ? (
              /* Empty state */
              <div style={{ textAlign: 'center', padding: '40px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, var(--blue-bg), #dbe9ff)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,87,184,.12)' }}>
                  <FileText size={30} color="var(--blue)" />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>No prescriptions yet</p>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>Upload your doctor's prescription to include it in this order</p>
                </div>
                <button className="btn-primary" style={{ width: 'auto', padding: '11px 28px' }}
                  onClick={() => setUploadOptionOpen(true)}>
                  Upload prescription
                </button>
              </div>
            ) : (
              /* Scripts list */
              <>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>Prescriptions</span>
                    <span style={{ marginLeft: 6, fontSize: 12, fontWeight: 700, background: 'var(--blue)', color: '#fff', borderRadius: 20, padding: '1px 8px' }}>{uploadedScripts.length}</span>
                  </div>
                  <button
                    style={{ border: '1.5px solid var(--blue)', background: 'var(--blue-bg)', color: 'var(--blue)', fontSize: 12, fontWeight: 700, cursor: 'pointer', borderRadius: 20, padding: '5px 14px' }}
                    onClick={() => setUploadOptionOpen(true)}>
                    + Add another
                  </button>
                </div>

                {/* Script cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {uploadedScripts.map((script, idx) => (
                    <div key={script.id}
                      style={{
                        background: 'var(--white)',
                        border: '1.5px solid var(--border)',
                        borderRadius: 14,
                        padding: '14px 14px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        boxShadow: '0 2px 8px rgba(0,43,92,.07)',
                        transition: 'box-shadow .15s'
                      }}>
                      {/* Icon */}
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, var(--blue-bg), #dbe9ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
                        <FileText size={22} color="var(--blue)" />
                        {/* Checkmark badge */}
                        <div style={{ position: 'absolute', bottom: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                          <Check size={9} color="#fff" strokeWidth={3} />
                        </div>
                      </div>

                      {/* Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>
                          {script.label}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 10, fontWeight: 600, background: 'var(--green-bg)', color: 'var(--green)', borderRadius: 20, padding: '2px 8px' }}>✓ Uploaded</span>
                          <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{script.uploadedAt}</span>
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => handleRemoveScript(script.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <X size={15} color="var(--text-3)" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Info note */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', background: 'var(--blue-bg)', borderRadius: 10, border: '1px solid rgba(0,87,184,.12)' }}>
                  <Info size={13} color="var(--blue)" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 11, color: 'var(--blue)', lineHeight: 1.5 }}>Our pharmacist will review your prescription(s) and contact you before dispensing.</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── REPEAT ORDER TAB ─── */}
        {activeShopTab === 'Repeat Order' && (() => {

          /* ── REPEAT LIST VIEW ── */
          if (repeatView === 'list') return (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 2 }}>Your active repeat prescriptions</div>

                {REPEAT_SCRIPTS.map(script => {
                  const isSelected = selectedRefills.includes(script.id);
                  const filledBars = script.refillsLeft;
                  const emptyBars = script.totalRefills - filledBars;
                  return (
                    <div key={script.id} style={{
                      background: 'var(--white)',
                      borderRadius: 14,
                      border: isSelected ? '1.5px solid var(--green)' : '1.5px solid var(--border)',
                      padding: '14px 14px 12px',
                      boxShadow: isSelected ? '0 4px 16px rgba(61,181,74,.12)' : '0 2px 6px rgba(0,43,92,.06)',
                      transition: 'all .18s'
                    }}>
                      {/* Medicine name */}
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '0.01em' }}>{script.name}</div>
                      {/* Patient name */}
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', marginTop: 2 }}>{script.patient}</div>

                      <div style={{ height: 1, background: 'var(--border)', margin: '10px 0' }} />

                      {/* Doctor + refill info */}
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{script.doctor}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Next refill: {script.nextRefill}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)' }}>{script.refillsLeft} refills left</span>
                      </div>

                      {/* Refill progress bar */}
                      <div style={{ display: 'flex', gap: 4, marginTop: 8, marginBottom: 12 }}>
                        {Array.from({ length: script.totalRefills }).map((_, i) => (
                          <div key={i} style={{
                            flex: 1, height: 5, borderRadius: 3,
                            background: i < filledBars ? 'var(--green)' : 'var(--border)'
                          }} />
                        ))}
                      </div>

                      {/* Order refill button */}
                      <button
                        onClick={() => toggleRefill(script.id)}
                        style={{
                          width: '100%',
                          padding: '11px',
                          borderRadius: 30,
                          border: isSelected ? '2px solid var(--green)' : 'none',
                          background: isSelected ? 'var(--green-bg)' : 'linear-gradient(135deg, var(--blue), var(--navy))',
                          color: isSelected ? 'var(--green)' : '#fff',
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          transition: 'all .18s'
                        }}>
                        {isSelected ? <><Check size={14} strokeWidth={3} /> Order refill</> : 'Order refill'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Sticky "Review Order" button */}
              {totalCartItems > 0 && (
                <div style={{ position: 'sticky', bottom: 0, padding: '12px 16px', background: 'var(--white)', borderTop: '1px solid var(--border)' }}>
                  <button className="btn-primary" onClick={() => setCurrentScreen('clicksgo_review')}>
                    Review Order ({totalCartItems} items)
                  </button>
                </div>
              )}
            </div>
          );

          /* ── YOUR ORDER VIEW ── */
          if (repeatView === 'order') {
            const chosenScripts = REPEAT_SCRIPTS.filter(s => selectedRefills.includes(s.id));
            return (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>

                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-1)' }}>Refill/repeats</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)' }}>{chosenScripts.length} added</span>
                  </div>

                  {/* Selected script items */}
                  {chosenScripts.map(script => (
                    <div key={script.id} style={{
                      background: 'var(--white)',
                      border: '1.5px solid var(--border)',
                      borderRadius: 14,
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      boxShadow: '0 2px 8px rgba(0,43,92,.06)'
                    }}>
                      {/* Icon */}
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg, var(--blue-bg), #d4e6ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 22 }}>⏱️</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-1)' }}>{script.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{script.patient}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{script.refillsLeft} refills left</div>
                      </div>
                      <button onClick={() => toggleRefill(script.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                        <X size={15} color="var(--text-3)" />
                      </button>
                    </div>
                  ))}

                  {/* Automatic refills toggle */}
                  <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>Automatic refills</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Automatically process refills</div>
                      </div>
                      {/* Toggle */}
                      <div onClick={() => setAutoRefills(!autoRefills)}
                        style={{ width: 44, height: 24, borderRadius: 12, background: autoRefills ? 'var(--blue)' : '#CBD5E1', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
                        <div style={{ position: 'absolute', top: 2, left: autoRefills ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.2)', transition: 'left .2s' }} />
                      </div>
                    </div>
                  </div>

                  {/* Accept generic substitutions toggle */}
                  <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>Accept generic substitutions?</div>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--text-3)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, cursor: 'help' }}>?</div>
                      </div>
                      <div onClick={() => setAcceptGenericSub(!acceptGenericSub)}
                        style={{ width: 44, height: 24, borderRadius: 12, background: acceptGenericSub ? 'var(--blue)' : '#CBD5E1', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
                        <div style={{ position: 'absolute', top: 2, left: acceptGenericSub ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.2)', transition: 'left .2s' }} />
                      </div>
                    </div>
                  </div>

                  {/* Add instructions for pharmacist */}
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Add to order</div>
                  <div onClick={() => setInstructionsSheetOpen(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg)', borderRadius: 12, padding: '14px 16px', cursor: 'pointer', border: '1px solid var(--border)' }}>
                    <Plus size={18} color="var(--blue)" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Add instructions for pharmacist</span>
                    {pharmacistNote.length > 0 && (
                      <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, background: 'var(--blue)', color: '#fff', borderRadius: 20, padding: '2px 8px' }}>✓ Added</span>
                    )}
                  </div>
                </div>

                {/* Order now button */}
                <div style={{ padding: '12px 16px', background: 'var(--white)', borderTop: '1px solid var(--border)' }}>
                  <button className="btn-primary" onClick={() => setRepeatView('medical_aid')}>
                    Order now
                  </button>
                </div>
              </div>
            );
          }

          /* ── MEDICAL AID CLAIM VIEW ── */
          if (repeatView === 'medical_aid') return (
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>
              {/* Step indicator */}
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--green)' }} />
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--border)' }} />
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy)', lineHeight: 1.3 }}>Do you want to claim from this medical aid for this medication?</h2>

              {/* Medical aid card */}
              <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '14px 16px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-1)' }}>Clicks Medical Aid</div>
                    <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 3 }}>Plan: <strong>Primary</strong></div>
                    <div style={{ fontSize: 11, color: 'var(--text-2)' }}>Member: <strong>C***a</strong></div>
                    <div style={{ fontSize: 11, color: 'var(--text-2)' }}>Dep code: <strong>00</strong></div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 700, cursor: 'pointer' }}>Edit</span>
                </div>
              </div>

              {/* Radio option */}
              <div onClick={() => setRepeatMedicalAidChoice(repeatMedicalAidChoice === 'yes' ? null : 'yes')}
                style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${repeatMedicalAidChoice === 'yes' ? 'var(--blue)' : 'var(--text-3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'border-color .15s' }}>
                  {repeatMedicalAidChoice === 'yes' && <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--blue)' }} />}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Claim from medical aid above</span>
              </div>

              <div style={{ flex: 1 }} />

              {/* CTA buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button className="btn-primary"
                  onClick={() => { setRepeatView('list'); setSelectedRefills([]); localStorage.removeItem('clicksgo_selected_refills'); setCurrentScreen('clicksgo_track'); }}
                  style={{ opacity: repeatMedicalAidChoice === 'yes' ? 1 : 0.6 }}>
                  Yes, claim from medical aid
                </button>
                <button
                  onClick={() => { setRepeatView('list'); setSelectedRefills([]); localStorage.removeItem('clicksgo_selected_refills'); setCurrentScreen('clicksgo_track'); }}
                  style={{ background: 'none', border: 'none', color: 'var(--blue)', fontWeight: 700, fontSize: 14, cursor: 'pointer', padding: '8px 0', textAlign: 'center' }}>
                  No, I will pay later
                </button>
              </div>
            </div>
          );

          return null;
        })()}

        {/* Proceed to checkout – OTC / scripts only */}
        {activeShopTab !== 'Repeat Order' && totalCartItems > 0 && (
          <div style={{ position: 'sticky', bottom: 0, padding: '12px 16px', background: 'var(--white)', borderTop: '1px solid var(--border)' }}>
            <button className="btn-primary" onClick={() => setCurrentScreen('clicksgo_review')}>
              Review Order ({totalCartItems} items)
            </button>
          </div>
        )}

      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // SCREEN 4: ClicksGo – Review Order
  // ══════════════════════════════════════════════════════════════════
  function renderClicksGoReview() {
    const ph = CLICKSGO_PHARMACY;
    
    const otcTotal = cartItems.reduce((a, i) => a + i.price * i.quantity, 0);
    
    const repeatOrderItems = REPEAT_SCRIPTS.filter(s => selectedRefills.includes(s.id));
    const repeatTotal = repeatOrderItems.reduce((a, s) => a + s.price, 0);

    const resolvedScripts = uploadedScripts.map((s, idx) => {
      return {
        id: s.id,
        name: s.label,
        subtext: '1 script uploaded',
        price: 0,
        uploadedAt: s.uploadedAt
      };
    });
    
    const rxTotal = resolvedScripts.reduce((a, s) => a + s.price, 0);
    
    const subtotal = otcTotal + rxTotal + repeatTotal;
    const deliveryFee = 15.00;
    const total = subtotal + deliveryFee;
    
    const totalItemsCount = cartItems.reduce((a, i) => a + i.quantity, 0) + uploadedScripts.length + selectedRefills.length;

    if (totalItemsCount === 0) {
      return (
        <div className="screen-root--fill" style={{ alignItems: 'center', justifyContent: 'center', gap: 12, padding: '40px 20px' }}>
          <ShoppingCart size={48} color="var(--text-3)" />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-3)' }}>Your cart is empty.</span>
          <button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}
            onClick={() => setCurrentScreen('clicksgo_shop')}>
            Start Shopping
          </button>
        </div>
      );
    }

    return (
      <div className="screen-root" style={{ gap: 14, paddingBottom: 24 }}>

        {/* Deliver to bar */}
        <div style={{ padding: '0 4px' }}>
          <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deliver to</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--navy)' }}>21, Park Street, Bengaluru <span style={{ fontSize: 10 }}>▼</span></span>
          </div>
        </div>

        {/* Pharmacy card */}
        <div className="card" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase' }}>Your pharmacy</span>
            <span className="chip chip--green" style={{ fontSize: 10, padding: '2px 8px' }}>{ph.distance} away</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{ph.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <Clock size={12} color="var(--blue)" />
            <span>15 min delivery (2 hours) · Delivery fee: R{deliveryFee.toFixed(2)}</span>
          </div>
        </div>

        {/* Items header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-1)' }}>
            Your items ({totalItemsCount})
          </span>
          <span style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 700, cursor: 'pointer' }}
            onClick={() => setCurrentScreen('clicksgo_shop')}>Edit</span>
        </div>

        {/* OTC items section */}
        {cartItems.length > 0 && (
          <div className="card" style={{ padding: '0 14px' }}>
            <div style={{ padding: '12px 0 6px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--blue)' }}>OTC items</span>
            </div>
            {cartItems.map(item => (
              <div key={item.id} className="product-row" style={{ padding: '12px 0' }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={18} color="var(--blue)" />
                </div>
                <div className="product-row__info" style={{ flex: 1, minWidth: 0 }}>
                  <span className="product-row__name" style={{ fontSize: 12, fontWeight: 700 }}>{item.name}</span>
                  <span className="product-row__sub" style={{ fontSize: 11, color: 'var(--text-3)' }}>{item.subtext}</span>
                  <span className="product-row__price" style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-1)', marginTop: 2 }}>R{item.price.toFixed(2)}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>Qty: {item.quantity}</span>
              </div>
            ))}
          </div>
        )}

        {/* Doctor's script items section */}
        {resolvedScripts.length > 0 && (
          <div className="card" style={{ padding: '0 14px' }}>
            <div style={{ padding: '12px 0 6px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--navy)' }}>Doctor's script</span>
            </div>
            {resolvedScripts.map(item => (
              <div key={item.id} className="product-row" style={{ padding: '12px 0' }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={18} color="var(--navy)" />
                </div>
                <div className="product-row__info" style={{ flex: 1, minWidth: 0 }}>
                  <span className="product-row__name" style={{ fontSize: 12, fontWeight: 700 }}>{item.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Repeat order items section */}
        {repeatOrderItems.length > 0 && (
          <div className="card" style={{ padding: '0 14px' }}>
            <div style={{ padding: '12px 0 6px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--green)' }}>Repeat Order ({repeatOrderItems.length})</span>
            </div>
            {repeatOrderItems.map(item => (
              <div key={item.id} className="product-row" style={{ padding: '12px 0' }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={18} color="var(--green)" />
                </div>
                <div className="product-row__info" style={{ flex: 1, minWidth: 0 }}>
                  <span className="product-row__name" style={{ fontSize: 12, fontWeight: 700 }}>{item.name}</span>
                  <span className="product-row__sub" style={{ fontSize: 11, color: 'var(--text-3)' }}>Patient: {item.patient} · Refills left: {item.refillsLeft}</span>
                  <span className="product-row__price" style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-1)', marginTop: 2 }}>R{item.price.toFixed(2)}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>Qty: 1</span>
              </div>
            ))}
          </div>
        )}

        {/* Prescription Options (if scripts or repeat order are present) */}
        {(resolvedScripts.length > 0 || repeatOrderItems.length > 0) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Automatic refills toggle (for repeat orders) */}
            {repeatOrderItems.length > 0 && (
              <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>Automatic refills</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Automatically process refills</div>
                  </div>
                  {/* Toggle */}
                  <div onClick={() => setAutoRefills(!autoRefills)}
                    style={{ width: 44, height: 24, borderRadius: 12, background: autoRefills ? 'var(--blue)' : '#CBD5E1', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: 2, left: autoRefills ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.2)', transition: 'left .2s' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Accept generic substitutions toggle */}
            <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>Accept generic substitutions?</div>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--text-3)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, cursor: 'help' }}>?</div>
                </div>
                <div onClick={() => setAcceptGenericSub(!acceptGenericSub)}
                  style={{ width: 44, height: 24, borderRadius: 12, background: acceptGenericSub ? 'var(--blue)' : '#CBD5E1', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 2, left: acceptGenericSub ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.2)', transition: 'left .2s' }} />
                </div>
              </div>
            </div>

            {/* Add instructions for pharmacist */}
            <div onClick={() => setInstructionsSheetOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg)', borderRadius: 12, padding: '12px 14px', cursor: 'pointer', border: '1px solid var(--border)' }}>
              <Plus size={18} color="var(--blue)" />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Add instructions for pharmacist</span>
              {pharmacistNote.length > 0 && (
                <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, background: 'var(--blue)', color: '#fff', borderRadius: 20, padding: '2px 8px' }}>✓ Added</span>
              )}
            </div>
          </div>
        )}

        {/* Pricing breakdown */}
        <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-2)' }}>
            <span>Subtotal</span>
            <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>R{subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-2)' }}>
            <span>Delivery fee</span>
            <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>R{deliveryFee.toFixed(2)}</span>
          </div>
          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800 }}>
            <span style={{ color: 'var(--navy)' }}>Total</span>
            <span style={{ color: 'var(--navy)' }}>R{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Confirm button */}
        <button className="btn-primary" onClick={handleOrderSubmission}>
          Confirm order
        </button>

      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // SCREEN 5: ClicksGo – Confirm Order
  // ══════════════════════════════════════════════════════════════════
  function renderClicksGoConfirm() {
    const otcTotal = cartItems.reduce((a, i) => a + i.price * i.quantity, 0);
    const rxTotal = scriptCartItems.reduce((a, i) => a + i.price * i.quantity, 0);
    const subtotal = otcTotal + rxTotal;

    return (
      <div className="screen-root" style={{ gap: 14, paddingBottom: 24 }}>

        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>Review & Confirm Order</h2>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Review your items, delivery & payment</p>
        </div>

        {/* Pharmacy summary card */}
        <div className="card card--elevated" style={{ padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>Your pharmacy</span>
            <span className="chip chip--green">{CLICKSGO_PHARMACY.distance}</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{CLICKSGO_PHARMACY.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>
            {CLICKSGO_PHARMACY.deliveryTime} · Delivery fee: {CLICKSGO_PHARMACY.deliveryFee}
          </div>
        </div>

        {/* Items (compact) */}
        <div className="card" style={{ padding: '10px 14px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>
            Your Items ({cartItems.length + scriptCartItems.length})
          </div>
          {[...cartItems, ...scriptCartItems].map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{item.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{item.subtext}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)' }}>R{item.price.toFixed(2)}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Qty {item.quantity}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment */}
        <div className="card" style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="summary-line">
            <span>Subtotal</span>
            <span style={{ fontWeight: 600 }}>R{subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-line">
            <span>Delivery fee</span>
            <span>Rxx</span>
          </div>
          <div className="summary-line summary-line--total">
            <span>Total</span>
            <span style={{ color: 'var(--navy)' }}>Rxx.xx</span>
          </div>
        </div>

        {/* Payment notice */}
        <div style={{ fontSize: 11, color: 'var(--text-2)', padding: '8px 12px', background: 'var(--blue-bg)', borderRadius: 8, border: '1px solid rgba(0,87,184,.12)' }}>
          💳 Payment Request sent to you – We'll notify you when it's time to pay
        </div>

        <button className="btn-primary" onClick={handleOrderSubmission}>
          Confirm &amp; Place Order
        </button>

      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // SCREEN: ClicksGo – Who is the script for?
  // ══════════════════════════════════════════════════════════════════
  function renderClicksGoRecipient() {
    const options = [
      ...INITIAL_DEPENDENTS.map(d => d.name),
      "Add a dependant"
    ];

    return (
      <div className="screen-root" style={{ gap: 16, padding: '24px 20px', background: '#fff', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Title */}
        <div style={{ marginTop: 8, marginBottom: 12 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)', lineHeight: 1.3 }}>
            Who is the script for?
          </h2>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => {
                const otcCount = successOrder?.products.filter(p => !p.subtext?.includes('script') && !p.subtext?.includes('Refill')).length ?? 1;
                const scriptCount = successOrder?.products.filter(p => p.subtext?.includes('script') || p.subtext?.includes('Refill')).length ?? 0;
                const hasOtc = otcCount > 0;
                const hasScript = scriptCount > 0;

                if (hasOtc) {
                  setCurrentScreen('clicksgo_questionnaire_otc');
                } else if (hasScript) {
                  setCurrentScreen('clicksgo_questionnaire_script');
                } else {
                  setCurrentScreen('clicksgo_track');
                }
              }}
              style={{
                width: '100%',
                background: '#f1f3f9',
                border: 'none',
                borderRadius: 12,
                padding: '18px 20px',
                textAlign: 'left',
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--navy)',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease, transform 0.1s ease',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6eaf3'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f3f9'}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // SCREEN: ClicksGo – Medical Questionnaire (OTC)
  // ══════════════════════════════════════════════════════════════════
  function renderClicksGoQuestionnaireOtc() {
    const hasScript = successOrder?.products.some(p => p.subtext?.includes('script') || p.subtext?.includes('Refill')) || false;

    return (
      <div className="screen-root" style={{ gap: 16, padding: '20px 20px 30px', background: '#fff', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        
        {/* Custom Header with Progress Bar and Close button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, marginBottom: 12 }}>
          <button className="app-bar__icon-btn" onClick={handleBackNavigation} style={{ padding: 0, margin: 0 }}>
            <ArrowLeft size={20} color="var(--navy)" />
          </button>
          
          {/* Progress bar slots (6 segments, first 4 green) */}
          <div style={{ display: 'flex', gap: 6, flex: 1, justifyContent: 'center', maxWidth: 160 }}>
            {[1, 2, 3, 4, 5, 6].map(slot => (
              <div
                key={slot}
                style={{
                  height: 4,
                  flex: 1,
                  borderRadius: 2,
                  background: slot <= 4 ? '#7cb342' : '#dde3ef'
                }}
              />
            ))}
          </div>

          <button className="app-bar__icon-btn" onClick={() => setCurrentScreen('clicksgo_home')} style={{ padding: 0, margin: 0 }}>
            <X size={20} color="var(--navy)" />
          </button>
        </div>

        {/* Title */}
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)', marginBottom: 12 }}>
            Medical questionnaire
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
            Before we can process this OTC order, please answer a few medical questions for the patient. This may be for you or a dependant, and helps our pharmacist confirm the medicine is safe and suitable.
          </p>
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />

        {/* Question 1 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.4 }}>
            Does your basket contain any medications you have not taken before? *
          </span>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setOtcQ1('Yes')}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: 10,
                border: otcQ1 === 'Yes' ? 'none' : '1.5px solid var(--border)',
                background: otcQ1 === 'Yes' ? 'var(--blue)' : '#fff',
                color: otcQ1 === 'Yes' ? '#fff' : 'var(--text-1)',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              Yes
            </button>
            <button
              onClick={() => setOtcQ1('No')}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: 10,
                border: otcQ1 === 'No' ? 'none' : '1.5px solid var(--border)',
                background: otcQ1 === 'No' ? 'var(--blue)' : '#fff',
                color: otcQ1 === 'No' ? '#fff' : 'var(--text-1)',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              No
            </button>
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />

        {/* Question 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.4 }}>
            Do you have any pre-existing conditions or are there any medical conditions we should know about (e.g., High blood pressure, pregnancy, or breastfeeding)? *
          </span>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setOtcQ2('Yes')}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: 10,
                border: otcQ2 === 'Yes' ? 'none' : '1.5px solid var(--border)',
                background: otcQ2 === 'Yes' ? 'var(--blue)' : '#fff',
                color: otcQ2 === 'Yes' ? '#fff' : 'var(--text-1)',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              Yes
            </button>
            <button
              onClick={() => setOtcQ2('No')}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: 10,
                border: otcQ2 === 'No' ? 'none' : '1.5px solid var(--border)',
                background: otcQ2 === 'No' ? 'var(--blue)' : '#fff',
                color: otcQ2 === 'No' ? '#fff' : 'var(--text-1)',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              No
            </button>
          </div>

          {otcQ2 === 'Yes' && (
            <input
              type="text"
              value={otcQ2Text}
              onChange={(e) => setOtcQ2Text(e.target.value)}
              placeholder="e.g. High blood pressure, pregnancy, etc."
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 10,
                border: '1.5px solid var(--border)',
                fontSize: 13,
                outline: 'none',
                marginTop: 4,
                fontFamily: 'Inter, sans-serif'
              }}
            />
          )}
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />

        {/* Question 3 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.4 }}>
            Are you currently taking any other medication? *
          </span>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setOtcQ3('Yes')}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: 10,
                border: otcQ3 === 'Yes' ? 'none' : '1.5px solid var(--border)',
                background: otcQ3 === 'Yes' ? 'var(--blue)' : '#fff',
                color: otcQ3 === 'Yes' ? '#fff' : 'var(--text-1)',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              Yes
            </button>
            <button
              onClick={() => setOtcQ3('No')}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: 10,
                border: otcQ3 === 'No' ? 'none' : '1.5px solid var(--border)',
                background: otcQ3 === 'No' ? 'var(--blue)' : '#fff',
                color: otcQ3 === 'No' ? '#fff' : 'var(--text-1)',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              No
            </button>
          </div>
        </div>

        {/* Continue Button */}
        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          <button
            className="btn-primary"
            onClick={() => {
              if (hasScript) {
                setCurrentScreen('clicksgo_questionnaire_script');
              } else {
                setCurrentScreen('clicksgo_track');
              }
            }}
            style={{ width: '100%', borderRadius: 30, padding: '14px 0', fontSize: 15, fontWeight: 700 }}
          >
            Continue
          </button>
        </div>

      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // SCREEN: ClicksGo – Your Medical Information (Script)
  // ══════════════════════════════════════════════════════════════════
  function renderClicksGoQuestionnaireScript() {
    return (
      <div className="screen-root" style={{ gap: 16, padding: '20px 20px 30px', background: '#fff', minHeight: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        
        {/* Custom Header with Back Chevron only */}
        <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 10, marginBottom: 4 }}>
          <button className="app-bar__icon-btn" onClick={handleBackNavigation} style={{ padding: 0, margin: 0 }}>
            <ArrowLeft size={20} color="var(--navy)" />
          </button>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 12 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)' }}>
            Your medical information
          </h2>
        </div>

        {/* Question 1: Accept Generic substitutions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
              Do you want to accept generic substitutions for this script?
            </span>
            <span style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', color: 'var(--navy)' }} onClick={() => alert("Generic substitutions are cheaper alternatives with the same active ingredients.")}>
              <Info size={14} />
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setScriptAcceptGeneric('Yes')}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: 10,
                border: scriptAcceptGeneric === 'Yes' ? 'none' : '1.5px solid var(--border)',
                background: scriptAcceptGeneric === 'Yes' ? 'var(--blue)' : '#fff',
                color: scriptAcceptGeneric === 'Yes' ? '#fff' : 'var(--text-1)',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              Yes
            </button>
            <button
              onClick={() => setScriptAcceptGeneric('No')}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: 10,
                border: scriptAcceptGeneric === 'No' ? 'none' : '1.5px solid var(--border)',
                background: scriptAcceptGeneric === 'No' ? 'var(--blue)' : '#fff',
                color: scriptAcceptGeneric === 'No' ? '#fff' : 'var(--text-1)',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              No
            </button>
          </div>
        </div>

        {/* Question 2: Allergies */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
            Do you have any allergies?
          </span>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={scriptAllergies}
              onChange={(e) => setScriptAllergies(e.target.value)}
              placeholder="Add allergies"
              style={{
                width: '100%',
                padding: '12px 40px 12px 14px',
                borderRadius: 10,
                border: '1.5px solid var(--border)',
                fontSize: 13,
                outline: 'none',
                fontFamily: 'Inter, sans-serif'
              }}
            />
            <button
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
            >
              <Plus size={18} color="var(--text-3)" />
            </button>
          </div>
        </div>

        {/* Question 3: Instructions for pharmacist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
            Do you want to add any specific instructions for your pharmacist?
          </span>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={scriptInstructions}
              onChange={(e) => setScriptInstructions(e.target.value)}
              placeholder="Add instructions"
              style={{
                width: '100%',
                padding: '12px 40px 12px 14px',
                borderRadius: 10,
                border: '1.5px solid var(--border)',
                fontSize: 13,
                outline: 'none',
                fontFamily: 'Inter, sans-serif'
              }}
            />
            <button
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
            >
              <Plus size={18} color="var(--text-3)" />
            </button>
          </div>
        </div>

        {/* Question 4: Process repeats automatically */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.4 }}>
            If your script includes repeats, would you like us to automatically process your repeats and notify you when it is ready for collection or delivery?
          </span>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setScriptAutoRefills('Yes')}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: 10,
                border: scriptAutoRefills === 'Yes' ? 'none' : '1.5px solid var(--border)',
                background: scriptAutoRefills === 'Yes' ? 'var(--blue)' : '#fff',
                color: scriptAutoRefills === 'Yes' ? '#fff' : 'var(--text-1)',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              Yes
            </button>
            <button
              onClick={() => setScriptAutoRefills('No')}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: 10,
                border: scriptAutoRefills === 'No' ? 'none' : '1.5px solid var(--border)',
                background: scriptAutoRefills === 'No' ? 'var(--blue)' : '#fff',
                color: scriptAutoRefills === 'No' ? '#fff' : 'var(--text-1)',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              No
            </button>
          </div>
        </div>

        {/* Continue Button */}
        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          <button
            className="btn-primary"
            onClick={() => {
              setCurrentScreen('clicksgo_track');
            }}
            style={{ width: '100%', borderRadius: 30, padding: '14px 0', fontSize: 15, fontWeight: 700 }}
          >
            Continue
          </button>
        </div>

      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // SCREEN 6: ClicksGo – Track My Order
  // ══════════════════════════════════════════════════════════════════
  function renderClicksGoTrack() {
    const order = successOrder || db.orders[0];
    const trackSteps = [
      { label: 'Order Placed', sub: "We've received your order", done: true },
      { label: 'Pharmacist busy with order', sub: 'Keep your phone near.', done: false, active: true },
      { label: 'Payment Request sent to you', sub: "We'll notify you when it's time to pay", done: false },
      { label: 'Delivery on route', sub: "We'll notify you when your order is on the way.", done: false }
    ];

    return (
      <div className="screen-root" style={{ gap: 14, paddingBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>Track my Order</h2>

        {/* Track steps */}
        <div className="card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {trackSteps.map((step, i) => (
            <div key={i}>
              <div className="track-step">
                <div className={`track-step__dot track-step__dot--${step.done ? 'done' : step.active ? 'active' : 'pending'}`}>
                  {step.done ? <Check size={11} /> : i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: step.done || step.active ? 'var(--text-1)' : 'var(--text-3)' }}>{step.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{step.sub}</div>
                </div>
              </div>
              {i < trackSteps.length - 1 && (
                <div style={{ width: 2, height: 20, background: step.done ? 'var(--green)' : 'var(--border)', marginLeft: 9, marginTop: -4, marginBottom: -4 }} />
              )}
            </div>
          ))}
        </div>

        {/* Order number + ETA */}
        <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>Order number</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--navy)', letterSpacing: '0.02em' }}>{order?.id || 'CG12345678'}</span>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Estimated delivery</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--green)', marginTop: 2 }}>Within 2 hours</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Clock size={10} />
              15 min delivery window ⓘ
            </div>
          </div>
        </div>

        <button className="btn-primary"
          style={{ background: 'linear-gradient(135deg, var(--green), #27a137)' }}
          onClick={() => { setCurrentScreen('clicksgo_home'); setActiveTab('MyClicks'); }}>
          Back to MyClicks
        </button>

      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // Home Dashboard (legacy - accessible from nav)
  // ══════════════════════════════════════════════════════════════════
  function renderHomeDashboard() {
    return (
      <div className="screen-root" style={{ gap: 14 }}>
        <div className="card" style={{ padding: 16 }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Welcome back,</span>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy)', marginTop: 2 }}>{db.user.fullName || db.user.name}</h2>
        </div>

        <div className="shortcut-grid">
          <div className="shortcut-card" onClick={() => { setCurrentScreen('clicksgo_address'); }}>
            <div className="shortcut-card__icon"><Zap size={20} color="var(--blue)" /></div>
            <span className="shortcut-card__label">ClicksGo</span>
          </div>
          <div className="shortcut-card" onClick={() => setUploadOptionOpen(true)}>
            <div className="shortcut-card__icon"><FileText size={20} color="var(--blue)" /></div>
            <span className="shortcut-card__label">Prescriptions</span>
          </div>
          <div className="shortcut-card" onClick={() => { setActiveTab('ClubCard'); setCurrentScreen('clubcard_view'); }}>
            <div className="shortcut-card__icon"><ShoppingBag size={20} color="var(--blue)" /></div>
            <span className="shortcut-card__label">ClubCard</span>
          </div>
          <div className="shortcut-card">
            <div className="shortcut-card__icon"><Activity size={20} color="var(--blue)" /></div>
            <span className="shortcut-card__label">My bookings</span>
          </div>
          <div className="shortcut-card" onClick={() => setUploadOptionOpen(true)}>
            <div className="shortcut-card__icon"><Plus size={20} color="var(--blue)" /></div>
            <span className="shortcut-card__label">My scripts</span>
          </div>
          <div className="shortcut-card" onClick={() => setCurrentScreen('order_history')}>
            <div className="shortcut-card__icon"><Package size={20} color="var(--blue)" /></div>
            <span className="shortcut-card__label">My orders</span>
          </div>
        </div>
      </div>
    );
  }

  // My Account Screen
  function renderMyAccountScreen() {
    return (
      <div className="screen-root" style={{ gap: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>My Account</h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '16px 0' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), var(--navy))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800 }}>
            {db.user.avatar}
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)' }}>{db.user.name}</span>
        </div>
        {['Personal and medical details', 'Change password', 'Address management', 'Notifications'].map(item => (
          <div key={item} className="card" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{item}</span>
            <ChevronRight size={16} color="var(--text-3)" />
          </div>
        ))}
      </div>
    );
  }

  // Order History
  function renderOrderHistoryScreen() {
    return (
      <div className="screen-root" style={{ gap: 14 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>My orders</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {db.orders.map(order => (
            <div key={order.id} className="card" style={{ padding: 14, cursor: 'pointer' }}
              onClick={() => { setSuccessOrder(order); setCurrentScreen('order_details'); }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>#{order.id}</span>
                <span className="chip chip--blue">{order.status}</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{order.date} · {order.store}</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>R{order.total.toFixed(2)}</span>
                <ChevronRight size={16} color="var(--text-3)" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Order Details
  function renderOrderDetailsScreen() {
    if (!successOrder) return null;
    return (
      <div className="screen-root" style={{ gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700 }}>Order {successOrder.id}</h2>
          <X size={18} onClick={() => setCurrentScreen('order_history')} style={{ cursor: 'pointer' }} />
        </div>
        <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={28} color="var(--green)" />
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>Thank you for your ClicksGo order!</h3>
        </div>
        <div className="card" style={{ padding: 14 }}>
          {successOrder.products?.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, color: 'var(--text-1)', fontWeight: 600 }}>{p.name}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)' }}>R{p.price.toFixed(2)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, marginTop: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Total</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--navy)' }}>R{successOrder.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  }

  // Product details
  function renderProductDetailsScreen() {
    if (!selectedProduct) return null;
    return (
      <div className="screen-root">
        <div style={{ background: 'var(--bg)', borderRadius: 12, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Activity size={64} color="var(--blue)" />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>{selectedProduct.name}</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--blue)' }}>R{selectedProduct.price.toFixed(2)}</span>
          <span style={{ color: 'var(--green)', fontWeight: 600, fontSize: 13 }}>In stock</span>
        </div>
        <button className="btn-primary" onClick={() => { handleAddToCart(selectedProduct); setCurrentScreen('clicksgo_shop'); }}>
          Add to cart
        </button>
      </div>
    );
  }

  // Pharmacy landing
  function renderPharmacyLanding() {
    return (
      <div className="screen-root" style={{ gap: 14 }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--navy)', textAlign: 'center' }}>How can Clicks Pharmacy help you today?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { icon: <ShoppingBag size={22} color="var(--blue)" />, label: 'I need medication', action: () => { setActiveShopTab('OTC Items'); setCurrentScreen('clicksgo_shop'); } },
            { icon: <Plus size={22} color="var(--blue)" />, label: 'Make a booking' },
            { icon: <Phone size={22} color="var(--blue)" />, label: 'I need help' }
          ].map(item => (
            <div key={item.label} className="card" style={{ padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', textAlign: 'center' }}
              onClick={item.action}>
              {item.icon}
              <span style={{ fontSize: 11, fontWeight: 600 }}>{item.label}</span>
            </div>
          ))}
        </div>
        <div className="card" style={{ border: '1.5px dashed var(--blue)', padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Your prescriptions will show up here once you have an active order.</span>
          <button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => setUploadOptionOpen(true)}>
            Add a new script
          </button>
        </div>
      </div>
    );
  }

  // ClubCard view
  function renderClubCardView() {
    return (
      <div className="screen-root" style={{ gap: 20, alignItems: 'center' }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)' }}>My ClubCard</h2>
        <div style={{ width: '100%', maxWidth: 320, height: 180, borderRadius: 18, background: 'linear-gradient(135deg, #002B5C, #0057B8)', boxShadow: '0 12px 32px rgba(0,43,92,.3)', color: '#fff', padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '0.04em' }}>CLICKS</span>
            <span style={{ fontSize: 10, opacity: .7 }}>CLUBCARD</span>
          </div>
          <div>
            <div style={{ fontSize: 11, opacity: .7 }}>{db.user.name}</div>
            <div style={{ fontSize: 14, letterSpacing: '0.1em', fontWeight: 600 }}>6007 1122 3344 5566</div>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Points balance: 211 pts</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Cashback available: R 0.00</div>
        </div>
      </div>
    );
  }

  // Login screens
  function renderLoginFlow() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: '#fff' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--navy), var(--blue))', padding: '48px 24px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <ClicksGoLogo size="lg" />
          <span style={{ color: 'rgba(255,255,255,.7)', fontSize: 13, fontWeight: 400 }}>Your health. Delivered fast.</span>
        </div>
        <div style={{ flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {currentScreen === 'login_email' ? (
            <>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)' }}>Sign in to your account</h2>
                <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>Enter your email, ClubCard or cell number.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>Email / ClubCard / Cell Phone</label>
                <input type="text" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                  style={{ border: '1.5px solid var(--border)', borderRadius: 10, padding: '13px 14px', fontSize: 14, outline: 'none', width: '100%' }} />
              </div>
              <button className="btn-primary" onClick={() => setCurrentScreen('login_password')}>Continue</button>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Don't have an account? </span>
                <span style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600, cursor: 'pointer' }}>Register</span>
              </div>
            </>
          ) : (
            <>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)' }}>Welcome back!</h2>
                <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>Enter your password to sign in as <strong>{loginEmail}</strong>.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>Password</label>
                  <span style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600, cursor: 'pointer' }}>Forgot password?</span>
                </div>
                <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{ border: '1.5px solid var(--border)', borderRadius: 10, padding: '13px 14px', fontSize: 14, outline: 'none', width: '100%' }} />
              </div>
              <button className="btn-primary" onClick={handleSignInSubmit}>
                {isSigningIn
                  ? <div className="loading-spinner-circle" style={{ width: 22, height: 22, borderTopColor: '#fff', margin: '0 auto' }} />
                  : 'Sign in'}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  function handleSignInSubmit() {
    setIsSigningIn(true);
    setTimeout(() => { setIsSigningIn(false); setIsBiometricsPopup(true); }, 1200);
  }

  function confirmBiometricsAndSignIn() {
    setIsBiometricsPopup(false);
    setIsLoggedIn(true);
    setCurrentFlow('clicksgo');
    setCurrentScreen('clicksgo_home');
    setActiveTab('MyClicks');
  }

  // Script upload
  const startScriptUploadFn = () => { setUploadOptionOpen(false); setPhotoPermissionOpen(true); };
  const confirmPhotoPermissionFn = () => { setPhotoPermissionOpen(false); setPhotoLibraryOpen(true); };

  // ─── OVERLAYS ────────────────────────────────────────────────────────────
  function renderOverlays() {
    return (
      <>
        {/* Sidebar drawer */}
        {isDrawerOpen && (
          <div className="sidebar-drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
            <div className="sidebar-drawer-content" onClick={e => e.stopPropagation()}>
              <div style={{ padding: '28px 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <ClicksGoLogo />
                <X size={20} onClick={() => setIsDrawerOpen(false)} style={{ cursor: 'pointer' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 0' }}>
                {[
                  { label: 'ClicksGo – Quick Delivery', action: () => { setIsDrawerOpen(false); setCurrentScreen('clicksgo_address'); } },
                  { label: 'Shop by department', action: () => { setIsDrawerOpen(false); setActiveShopTab('OTC Items'); setCurrentScreen('clicksgo_shop'); } },
                  { label: 'My account', action: () => { setIsDrawerOpen(false); setCurrentScreen('my_account'); } },
                  { label: 'My orders', action: () => { setIsDrawerOpen(false); setCurrentScreen('order_history'); } },
                  { label: 'Buy a voucher' },
                  { label: 'Pay bills & buy prepaid' },
                ].map(item => (
                  <div key={item.label} onClick={item.action}
                    style={{ padding: '14px 20px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: 'var(--text-1)', opacity: item.action ? 1 : .5 }}>
                    <span>{item.label}</span>
                    {item.action && <ChevronRight size={16} color="var(--text-3)" />}
                  </div>
                ))}
              </div>
              <div style={{ padding: 20, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button className="btn-secondary"
                  onClick={() => { setIsDrawerOpen(false); setIsLoggedIn(false); setCurrentScreen('login_email'); }}>
                  Sign out
                </button>
                <span style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'center' }}>Version 9.2</span>
              </div>
            </div>
          </div>
        )}

        {/* Biometrics popup */}
        {isBiometricsPopup && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div style={{ background: '#fff', borderRadius: 18, padding: 24, width: '85%', maxWidth: 320, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <span style={{ fontSize: 36 }}>🔐</span>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Log in with biometrics</h3>
              <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Enable biometrics to sign in faster next time.</p>
              <button className="btn-primary" onClick={confirmBiometricsAndSignIn}>Enable biometrics</button>
              <button onClick={confirmBiometricsAndSignIn}
                style={{ background: 'none', color: 'var(--text-3)', border: 'none', padding: 8, cursor: 'pointer', fontSize: 12 }}>
                Maybe later
              </button>
            </div>
          </div>
        )}

        {/* Upload script options */}
        {uploadOptionOpen && (
          <div className="bottom-sheet-overlay" onClick={() => setUploadOptionOpen(false)}>
            <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
              <div className="bottom-sheet__handle" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>Add a new script</h3>
                <X size={18} onClick={() => setUploadOptionOpen(false)} style={{ cursor: 'pointer' }} />
              </div>
              <div style={{ display: 'flex', gap: 20, justifyContent: 'center', padding: '10px 0' }}>
                {[
                  { icon: <Camera size={24} color="var(--blue)" />, label: 'Take a photo' },
                  { icon: <Image size={24} color="var(--blue)" />, label: 'Upload a photo' }
                ].map(opt => (
                  <div key={opt.label} onClick={startScriptUploadFn}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {opt.icon}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{opt.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Photo permission */}
        {photoPermissionOpen && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div style={{ background: '#fff', borderRadius: 18, padding: 24, width: '85%', maxWidth: 320, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <span style={{ fontSize: 36 }}>📷</span>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Private Access to Photos</h3>
              <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Clicks requires photo permissions to select and upload your script.</p>
              <button className="btn-primary" onClick={confirmPhotoPermissionFn}>Allow Access</button>
              <button onClick={() => setPhotoPermissionOpen(false)}
                style={{ background: 'none', color: 'var(--text-3)', border: 'none', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Photo library */}
        {photoLibraryOpen && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div style={{ background: '#fff', borderRadius: 18, padding: 16, width: '90%', height: '80%', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>Select Photo</h3>
                <X size={18} onClick={() => setPhotoLibraryOpen(false)} style={{ cursor: 'pointer' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, overflowY: 'auto', flex: 1 }}>
                <div onClick={selectPhotoFromLibrary} style={{ cursor: 'pointer', border: '2px solid var(--blue)', borderRadius: 8, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--blue-bg)' }}>
                  <FileText size={28} color="var(--blue)" />
                </div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{ background: 'var(--border)', borderRadius: 8, height: 100 }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upload progress */}
        {isUploading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div style={{ background: '#fff', borderRadius: 18, padding: 24, width: '85%', maxWidth: 320, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="loading-spinner-circle" style={{ margin: '0 auto' }} />
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>Uploading your script</h3>
              <div style={{ width: '100%', height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'linear-gradient(90deg, var(--blue), var(--navy))', transition: 'width .15s ease' }} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{uploadProgress}%</span>
            </div>
          </div>
        )}

        {/* Pharmacist instructions sheet */}
        {instructionsSheetOpen && (
          <div className="bottom-sheet-overlay" onClick={() => setInstructionsSheetOpen(false)}>
            <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
              <div className="bottom-sheet__handle" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>Instructions for pharmacist</h3>
                <X size={18} onClick={() => setInstructionsSheetOpen(false)} style={{ cursor: 'pointer' }} />
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 12 }}>We'll add these instructions to your order. Include your preferred generic or alternative medication.</p>
              <textarea
                value={pharmacistNote}
                onChange={e => setPharmacistNote(e.target.value)}
                placeholder="Special instructions"
                rows={4}
                style={{ border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 13, outline: 'none', width: '100%', resize: 'none', fontFamily: 'Inter, sans-serif', color: 'var(--text-1)', marginBottom: 16 }}
              />
              <button className="btn-primary" onClick={() => setInstructionsSheetOpen(false)}>
                Add instructions
              </button>
            </div>
          </div>
        )}

        {/* Location overlay */}
        {locationOverlay && (
          <div className="bottom-sheet-overlay" onClick={() => setLocationOverlay(false)}>
            <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
              <div className="bottom-sheet__handle" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>Select a Clicks Pharmacy</h3>
                <X size={18} onClick={() => setLocationOverlay(false)} style={{ cursor: 'pointer' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {INITIAL_STORES.map(store => (
                  <div key={store.id}
                    onClick={() => { setSelectedStore(store); setLocationOverlay(false); }}
                    style={{ background: 'var(--bg)', padding: 12, borderRadius: 10, cursor: 'pointer', border: selectedStore.id === store.id ? '1.5px solid var(--blue)' : '1.5px solid transparent' }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{store.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{store.address}</div>
                    <div style={{ fontSize: 11, color: 'var(--blue)', marginTop: 2, fontWeight: 600 }}>{store.distance} away</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ─── MAIN RENDER ───────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>

      {/* FAB for demo controls on mobile */}
      <button className="demo-fab" onClick={() => setIsDemoOpen(!isDemoOpen)} title="Demo Controls">
        {isDemoOpen ? <X size={20} /> : <Plus size={20} />}
        <span>Demo Controls</span>
      </button>

      {/* Demo Dashboard */}
      <div className={`demo-dashboard ${isDemoOpen ? 'open' : ''}`}>
        <h3>ClicksGo Demo Control</h3>

        <button onClick={() => runDemoFlow('login')} className={`demo-btn ${!isLoggedIn ? 'active' : ''}`}>
          🔐 Login Flow
        </button>

        <div style={{ height: 1, background: 'rgba(255,255,255,.1)', margin: '4px 0' }} />

        <button onClick={() => runDemoFlow('clicksgo')} className={`demo-btn ${currentScreen === 'clicksgo_home' ? 'active' : ''}`}>
          🏠 Step 0: ClicksGo Home
        </button>
        <button onClick={() => runDemoFlow('clicksgo_address')} className={`demo-btn ${currentScreen === 'clicksgo_address' ? 'active' : ''}`}>
          📍 Step 1: Confirm Address
        </button>
        <button onClick={() => runDemoFlow('clicksgo_pharmacy')} className={`demo-btn ${currentScreen === 'clicksgo_pharmacy' ? 'active' : ''}`}>
          🏪 Step 2: Closest Pharmacy
        </button>
        <button onClick={() => runDemoFlow('clicksgo_shop')} className={`demo-btn ${currentScreen === 'clicksgo_shop' ? 'active' : ''}`}>
          🛒 Step 3: Shop In-Stock Items
        </button>
        <button onClick={() => runDemoFlow('clicksgo_review')} className={`demo-btn ${currentScreen === 'clicksgo_review' ? 'active' : ''}`}>
          📋 Step 4: Review Order
        </button>
        <button onClick={() => runDemoFlow('clicksgo_recipient')} className={`demo-btn ${currentScreen === 'clicksgo_recipient' ? 'active' : ''}`}>
          👥 Step 4.5: Who is script for?
        </button>
        <button onClick={() => runDemoFlow('clicksgo_questionnaire_otc')} className={`demo-btn ${currentScreen === 'clicksgo_questionnaire_otc' ? 'active' : ''}`}>
          📋 Step 4.6: Medical Questionnaire (OTC)
        </button>
        <button onClick={() => runDemoFlow('clicksgo_questionnaire_script')} className={`demo-btn ${currentScreen === 'clicksgo_questionnaire_script' ? 'active' : ''}`}>
          📋 Step 4.7: Medical Information (Script)
        </button>
        <button onClick={() => runDemoFlow('clicksgo_track')} className={`demo-btn ${currentScreen === 'clicksgo_track' ? 'active' : ''}`}>
          🚴 Step 5: Track My Order
        </button>

        <div style={{ height: 1, background: 'rgba(255,255,255,.1)', margin: '4px 0' }} />

        <button onClick={() => { setIsLoggedIn(true); runDemoFlow('clicksgo'); }} className="demo-btn" style={{ background: 'rgba(220,38,38,.25)' }}>
          🔄 Reset Demo
        </button>
      </div>

      {/* Main App Frame */}
      <div className="app-viewport-wrapper">
        {renderHeader()}
        <div className="app-screen-content"
          style={{ backgroundColor: (!isLoggedIn || ['clicksgo_recipient', 'clicksgo_questionnaire_otc', 'clicksgo_questionnaire_script'].includes(currentScreen)) ? '#ffffff' : 'var(--bg)' }}>
          {renderActiveScreen()}
        </div>
        {renderBottomNav()}
        {renderOverlays()}
      </div>

    </div>
  );
}
