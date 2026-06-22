import React, { useState, useEffect } from 'react';
import { 
  Menu, User, ShoppingBag, Plus, Search, ChevronRight, X, Camera, Image,
  ArrowLeft, Check, AlertCircle, ShoppingCart, Info, Phone, MessageSquare,
  Lock, ArrowRight, Star, Sliders
} from 'lucide-react';
import { loadState, saveState, INITIAL_PRODUCTS, INITIAL_STORES, INITIAL_DEPENDENTS } from './data/db';

export default function App() {
  // DB state loaded from local storage
  const [db, setDb] = useState(loadState());

  // Navigation states
  const [activeTab, setActiveTab] = useState('MyClicks'); // MyClicks, Shop, ClubCard, Pharmacy, Cart
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentFlow, setCurrentFlow] = useState('login'); // home, login, pharmacy, shop, cart, payment, script, otc_delivery
  const [currentScreen, setCurrentScreen] = useState('login_email'); // sub-screen routing

  // State managers
  const [loginEmail, setLoginEmail] = useState('adityatest36@gmail.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [isSignedOutPopup, setIsSignedOutPopup] = useState(false);
  const [isBiometricsPopup, setIsBiometricsPopup] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // default logged out

  // Shopping state
  const [cartItems, setCartItems] = useState([]);
  const [locationOverlay, setLocationOverlay] = useState(false);
  const [deliveryType, setDeliveryType] = useState('Store Collection'); // Delivery / Store Collection
  const [selectedStore, setSelectedStore] = useState(INITIAL_STORES[0]); // Edgemead
  const [selectedRecipient, setSelectedRecipient] = useState(INITIAL_DEPENDENTS[0]); // A***a N******a
  const [claimMedicalAid, setClaimMedicalAid] = useState(null); // yes / no
  const [medicalAidScheme, setMedicalAidScheme] = useState('heheh');
  const [medicalAidDepCode, setMedicalAidDepCode] = useState('55512');
  const [medicalAidMemberNum, setMedicalAidMemberNum] = useState('4545');
  const [paymentOption, setPaymentOption] = useState('Prepay with SMS payment link'); // SMS link or Card
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Promos');
  const [successOrder, setSuccessOrder] = useState(null);

  // Script state
  const [isScriptPopup, setIsScriptPopup] = useState(false);
  const [uploadOptionOpen, setUploadOptionOpen] = useState(false);
  const [photoPermissionOpen, setPhotoPermissionOpen] = useState(false);
  const [photoLibraryOpen, setPhotoLibraryOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedScriptImage, setUploadedScriptImage] = useState(null);
  const [scriptInfo, setScriptInfo] = useState({
    acceptGeneric: 'Yes',
    allergies: 'Alergy',
    instructions: 'call me',
    processRepeats: 'Yes'
  });
  const [isGenericTooltip, setIsGenericTooltip] = useState(false);

  // OTC / Delivery state
  const [deliveryNote, setDeliveryNote] = useState('Test');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [otcQuestionIndex, setOtcQuestionIndex] = useState(0);
  const [otcAnswers, setOtcAnswers] = useState({
    q1: 'No', // medications not taken before
    q2: 'Yes', // pre-existing conditions
    q2Text: 'Heaven',
    q3: 'Yes', // taking other meds
    q3Text: 'Dibs',
    q4: 'No', // known allergies
    q5: 'Sbdb' // symptoms
  });

  // Load and save state
  useEffect(() => {
    saveState(db);
    setCartItems(db.cart);
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
    const existing = updatedCart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      updatedCart.push({ ...product, quantity: 1 });
    }
    setCartItems(updatedCart);
    updateDbState({ cart: updatedCart });
  };

  const handleRemoveFromCart = (productId) => {
    const updatedCart = cartItems.filter(item => item.id !== productId);
    setCartItems(updatedCart);
    updateDbState({ cart: updatedCart });
  };

  const handleUpdateQuantity = (productId, amount) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + amount;
        return { ...item, quantity: newQty > 0 ? newQty : 1 };
      }
      return item;
    }).filter(item => item.quantity > 0);
    setCartItems(updatedCart);
    updateDbState({ cart: updatedCart });
  };

  // Helper to jump to flows for demo purposes
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

    if (flowName === 'home') {
      setActiveTab('MyClicks');
      setCurrentScreen('home_dashboard');
    } else if (flowName === 'login') {
      setIsLoggedIn(false);
      setCurrentScreen('login_email');
    } else if (flowName === 'pharmacy') {
      setActiveTab('Pharmacy');
      setCurrentScreen('pharmacy_landing');
    } else if (flowName === 'shop') {
      setActiveTab('Shop');
      setCurrentScreen('shop_landing');
    } else if (flowName === 'cart') {
      setActiveTab('Cart');
      setCurrentScreen('cart_view');
    } else if (flowName === 'script') {
      setActiveTab('Pharmacy');
      setCurrentScreen('pharmacy_landing');
      setIsScriptPopup(true);
    } else if (flowName === 'otc_delivery') {
      // Setup default cart with Buscopan for OTC flow
      const buscopan = INITIAL_PRODUCTS.find(p => p.id === 'buscopan-tablets');
      setCartItems([{ ...buscopan, quantity: 1 }]);
      setActiveTab('Cart');
      setCurrentScreen('cart_view');
    }
  };

  // Trigger script upload sequence
  const startScriptUpload = () => {
    setUploadOptionOpen(false);
    setPhotoPermissionOpen(true);
  };

  const confirmPhotoPermission = () => {
    setPhotoPermissionOpen(false);
    setPhotoLibraryOpen(true);
  };

  const selectPhotoFromLibrary = () => {
    setPhotoLibraryOpen(false);
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadedScriptImage(true);
          setCurrentScreen('script_recipient');
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleOrderSubmission = (type) => {
    // Exact RFM mapping from PDF requirements
    let rfmNum = "100000001249"; // Default click & collect
    if (currentFlow === 'script') rfmNum = "100000001250";
    if (currentFlow === 'otc_delivery') rfmNum = "100000001248";

    const newOrder = {
      id: rfmNum,
      date: new Date().toLocaleDateString('en-GB').split('/').join(' '),
      store: selectedStore.name,
      type: type,
      status: 'Processing',
      total: cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0) + (deliveryType === 'Delivery' ? 35 : 0),
      products: [...cartItems]
    };

    const updatedOrders = [newOrder, ...db.orders];
    updateDbState({ 
      orders: updatedOrders,
      cart: []
    });
    setCartItems([]);
    setSuccessOrder(newOrder);
    setCurrentScreen('order_submitted');
  };

  return (
    <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
      
      {/* Floating Demo Trigger Button (Mobile only) — small circle FAB */}
      <button
        className="demo-fab"
        onClick={() => setIsDemoOpen(!isDemoOpen)}
        title="Demo Controls"
        aria-label="Open demo controls"
      >
        {isDemoOpen ? <X size={20} /> : <Plus size={20} />}
        <span>Demo Controls</span>
      </button>

      {/* Demo Dashboard (collapsible on mobile, visible on desktop) */}
      <div className={`demo-dashboard ${isDemoOpen ? 'open' : ''}`}>
        <h3>Clicks Demo Control</h3>
        <button onClick={() => runDemoFlow('login')} className={`demo-btn ${currentFlow === 'login' ? 'active' : ''}`}>
          Flow 1: Login Sequence
        </button>
        <button onClick={() => runDemoFlow('home')} className={`demo-btn ${currentFlow === 'home' ? 'active' : ''}`}>
          Flow 1: Home & Drawer
        </button>
        <button onClick={() => runDemoFlow('script')} className={`demo-btn ${currentFlow === 'script' ? 'active' : ''}`}>
          Flow 4: Add New Script
        </button>
        <button onClick={() => runDemoFlow('shop')} className={`demo-btn ${currentFlow === 'shop' ? 'active' : ''}`}>
          Flow 2: Shop & Stores
        </button>
        <button onClick={() => runDemoFlow('otc_delivery')} className={`demo-btn ${currentFlow === 'otc_delivery' ? 'active' : ''}`}>
          Flow 5: OTC Delivery Flow
        </button>
        <button onClick={() => {
          updateDbState({ cart: [], orders: INITIAL_ORDERS });
          setCartItems([]);
          runDemoFlow('home');
        }} className="demo-btn" style={{ backgroundColor: '#c53030' }}>
          Reset Demo State
        </button>
      </div>

      {/* Main Mobile Screen Bezel */}
      <div className="app-viewport-wrapper">

        {/* Dynamic header depending on context */}
        {renderHeader()}

        {/* Scrollable screen content */}
        <div className="app-screen-content" style={{ backgroundColor: !isLoggedIn || currentScreen === 'payu_form' || currentScreen === 'payment_cancelled' ? '#ffffff' : 'var(--bg-gray)' }}>
          {renderActiveScreen()}
        </div>

        {/* Bottom Tab Nav Bar */}
        {renderBottomNav()}

        {/* Overlay Popups & Sheets */}
        {renderOverlays()}

      </div>

    </div>
  );

  // Render Clicks app headers matching screens
  function renderHeader() {
    if (currentScreen === 'payu_form' || currentScreen === 'payment_cancelled') {
      return null; // hide header in full screen payment forms
    }
    if (currentScreen === 'login_email' || currentScreen === 'login_password') {
      return null; // login screens have their own brand hero — no top bar needed
    }

    let leftButton = null;
    if (currentScreen === 'login_email') {
      leftButton = (
        <button onClick={() => runDemoFlow('home')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={22} color="var(--primary-blue)" />
        </button>
      );
    } else if (currentScreen === 'login_password') {
      leftButton = (
        <button onClick={() => setCurrentScreen('login_email')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={22} color="var(--primary-blue)" />
        </button>
      );
    } else if (currentScreen !== 'home_dashboard' && currentScreen !== 'pharmacy_landing' && currentScreen !== 'shop_landing' && currentScreen !== 'cart_view') {
      leftButton = (
        <button onClick={() => handleBackNavigation()} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={22} color="var(--primary-blue)" />
        </button>
      );
    } else {
      leftButton = (
        <button onClick={() => setIsDrawerOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <Menu size={22} color="var(--primary-blue)" />
        </button>
      );
    }

    return (
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {leftButton}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: 'var(--primary-blue)', fontWeight: 800, fontSize: '18px', letterSpacing: '0.05em' }}>CLICKS</span>
            <span style={{ color: 'var(--primary-green)', fontWeight: 800, fontSize: '18px' }}>+</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          {activeTab === 'Pharmacy' && (
            <Search size={20} color="var(--primary-blue)" style={{ cursor: 'pointer' }} />
          )}
          {isLoggedIn && (
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e2e8f0', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>
              {db.user.avatar}
            </div>
          )}
        </div>
      </div>
    );
  }

  function handleBackNavigation() {
    if (currentScreen === 'order_submitted') {
      setCurrentScreen('home_dashboard');
      setActiveTab('MyClicks');
    } else if (currentScreen === 'my_account') {
      setCurrentScreen('home_dashboard');
    } else if (currentScreen === 'product_details') {
      setCurrentScreen(activeTab === 'Pharmacy' ? 'pharmacy_landing' : 'shop_landing');
    } else if (currentScreen === 'script_recipient') {
      setCurrentScreen('pharmacy_landing');
    } else if (currentScreen === 'script_medical_info') {
      setCurrentScreen('script_recipient');
    } else if (currentScreen === 'script_medical_aid') {
      setCurrentScreen('script_medical_info');
    } else if (currentScreen === 'script_prepayment') {
      setCurrentScreen('script_medical_aid');
    } else if (currentScreen === 'otc_questionnaire') {
      setCurrentScreen('cart_view');
    } else if (currentScreen === 'checkout_details') {
      setCurrentScreen('cart_view');
    } else if (currentScreen === 'checkout_payment') {
      setCurrentScreen('checkout_details');
    } else if (currentScreen === 'order_details') {
      setCurrentScreen('order_history');
    } else if (currentScreen === 'order_history') {
      setCurrentScreen('home_dashboard');
    } else {
      setCurrentScreen('home_dashboard');
    }
  }

  // Render bottom nav matching screenshot tabs
  function renderBottomNav() {
    if (currentScreen === 'login_email' || currentScreen === 'login_password' || currentScreen === 'payu_form' || currentScreen === 'payment_cancelled') {
      return null;
    }

    return (
      <div className="bottom-nav-bar">
        <button onClick={() => { setActiveTab('MyClicks'); setCurrentScreen('home_dashboard'); }} className={`nav-tab-button ${activeTab === 'MyClicks' ? 'active' : ''}`}>
          <User />
          <span>MyClicks</span>
        </button>
        <button onClick={() => { setActiveTab('Shop'); setCurrentScreen('shop_landing'); }} className={`nav-tab-button ${activeTab === 'Shop' ? 'active' : ''}`}>
          <Search />
          <span>Shop</span>
        </button>
        <button onClick={() => { setActiveTab('ClubCard'); }} className={`nav-tab-button ${activeTab === 'ClubCard' ? 'active' : ''}`}>
          <ShoppingBag />
          <span>ClubCard</span>
        </button>
        <button onClick={() => { setActiveTab('Pharmacy'); setCurrentScreen('pharmacy_landing'); }} className={`nav-tab-button ${activeTab === 'Pharmacy' ? 'active' : ''}`}>
          <Plus />
          <span>Pharmacy</span>
        </button>
        <button onClick={() => { setActiveTab('Cart'); setCurrentScreen('cart_view'); }} className={`nav-tab-button ${activeTab === 'Cart' ? 'active' : ''}`}>
          <div className="cart-badge">
            <ShoppingCart />
            {cartItems.length > 0 && (
              <span className="cart-badge-count">{cartItems.reduce((acc, i) => acc + i.quantity, 0)}</span>
            )}
          </div>
          <span>Cart</span>
        </button>
      </div>
    );
  }

  // Active Screen Selector routing
  function renderActiveScreen() {
    if (!isLoggedIn) {
      return renderLoginFlow();
    }

    // Main App Views
    if (currentScreen === 'my_account') {
      return renderMyAccountScreen();
    }
    if (currentScreen === 'order_history') {
      return renderOrderHistoryScreen();
    }
    if (currentScreen === 'order_details') {
      return renderOrderDetailsScreen();
    }
    if (currentScreen === 'product_details') {
      return renderProductDetailsScreen();
    }
    if (currentScreen === 'order_submitted') {
      return renderOrderSubmittedScreen();
    }

    // Scripts wizard screens
    if (currentScreen === 'script_recipient') {
      return renderScriptRecipientScreen();
    }
    if (currentScreen === 'script_medical_info') {
      return renderScriptMedicalInfoScreen();
    }
    if (currentScreen === 'script_medical_aid') {
      return renderScriptMedicalAidScreen();
    }
    if (currentScreen === 'script_prepayment') {
      return renderScriptPrepaymentScreen();
    }

    // Checkout / Questionnaire sequence
    if (currentScreen === 'otc_questionnaire') {
      return renderOtcQuestionnaireScreen();
    }
    if (currentScreen === 'checkout_details') {
      return renderCheckoutDetailsScreen();
    }
    if (currentScreen === 'checkout_payment') {
      return renderCheckoutPaymentScreen();
    }
    if (currentScreen === 'payu_form') {
      return renderPayUFormScreen();
    }
    if (currentScreen === 'payment_cancelled') {
      return renderPaymentCancelledScreen();
    }

    // Standard tab loaders
    switch (activeTab) {
      case 'MyClicks':
        return renderHomeDashboard();
      case 'Shop':
        return renderShopLanding();
      case 'Pharmacy':
        return renderPharmacyLanding();
      case 'Cart':
        return renderCartView();
      case 'ClubCard':
        return renderClubCardView();
      default:
        return renderHomeDashboard();
    }
  }

  // --- RENDER SCREEN SUB-COMPONENTS ---

  // Flow 1: Home Dashboard Screen
  function renderHomeDashboard() {
    return (
      <div className="screen-root">
        
        {/* Welcome Text */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
          <span style={{ color: 'var(--text-gray)', fontSize: '12px' }}>Welcome back,</span>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary-blue)', marginTop: '4px' }}>A****a</h2>
        </div>

        {/* Shortcuts grid — round image icon buttons */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)' }}>My shortcuts</h3>
            <span style={{ fontSize: '12px', color: 'var(--primary-blue)', cursor: 'pointer' }}>Edit</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {/* My Bookings */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=120" alt="My bookings" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-dark)', textAlign: 'center', lineHeight: '1.2' }}>My bookings</span>
            </div>

            {/* My Scripts */}
            <div onClick={() => runDemoFlow('script')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <img src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=120" alt="My scripts" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-dark)', textAlign: 'center', lineHeight: '1.2' }}>My scripts</span>
            </div>

            {/* My Lists */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <img src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=120" alt="My lists" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-dark)', textAlign: 'center', lineHeight: '1.2' }}>My lists</span>
            </div>

            {/* My Orders */}
            <div onClick={() => setCurrentScreen('order_history')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=120" alt="My orders" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-dark)', textAlign: 'center', lineHeight: '1.2' }}>My orders</span>
            </div>
          </div>
        </div>


        {/* Promo banner */}
        <div style={{ borderRadius: '16px', overflow: 'hidden', height: '140px', position: 'relative', backgroundColor: '#e2f0fe' }}>
          <img src="https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&q=80&w=400" alt="Winter Fair" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.6), transparent)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '16px', color: '#ffffff' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-green)' }}>Winter Edition</span>
            <h4 style={{ fontSize: '18px', fontWeight: 800 }}>beauty fair</h4>
            <span style={{ fontSize: '12px', marginTop: '4px' }}>save 20%</span>
          </div>
        </div>

        {/* Recommended actions header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Recommended actions</h3>
          <span style={{ backgroundColor: 'var(--primary-blue)', color: '#ffffff', fontSize: '10px', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
        </div>

        {/* Recommended Product Promo Row */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '12px', display: 'flex', gap: '12px' }}>
          <img src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=100" alt="Essentiale" style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '11px', color: '#e53e3e', fontWeight: 600 }}>See Promotion</span>
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#e53e3e' }}>R 264.00</span>
            <span style={{ fontSize: '12px', fontWeight: 600, marginTop: '2px' }}>Essentiale</span>
            <span style={{ fontSize: '10px', color: 'var(--text-gray)' }}>Essentiale Extreme 300mg Liver Care G...</span>
          </div>
          <button onClick={() => {
            const prod = INITIAL_PRODUCTS.find(p => p.id === 'essentiale-extreme');
            handleAddToCart(prod);
          }} style={{ alignSelf: 'center', backgroundColor: 'var(--primary-blue)', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            Add
          </button>
        </div>

      </div>
    );
  }

  // My Account Detail Screen
  function renderMyAccountScreen() {
    return (
      <div className="screen-root">
        <h2 style={{ fontSize: '16px', fontWeight: 700, textAlign: 'center', color: 'var(--primary-blue)' }}>My Account</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 0' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'var(--primary-blue)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700 }}>
            {db.user.avatar}
          </div>
          <span style={{ fontWeight: 600 }}>{db.user.name}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="account-list-item" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Personal and medical details</span>
            <ChevronRight size={18} color="var(--text-gray)" />
          </div>
          <div className="account-list-item" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Change password</span>
            <ChevronRight size={18} color="var(--text-gray)" />
          </div>
          <div className="account-list-item" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Address management</span>
            <ChevronRight size={18} color="var(--text-gray)" />
          </div>
          <div className="account-list-item" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Notifications</span>
              <span style={{ backgroundColor: '#e53e3e', color: '#ffffff', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '10px' }}>0</span>
            </div>
            <ChevronRight size={18} color="var(--text-gray)" />
          </div>
        </div>
      </div>
    );
  }

  // Order history status screens
  function renderOrderHistoryScreen() {
    return (
      <div className="screen-root">
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-blue)' }}>My orders</h2>
        
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-blue)', borderBottom: '2px solid var(--primary-blue)', paddingBottom: '4px' }}>All orders</span>
          <span style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Sort by</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {db.orders.map(order => (
            <div key={order.id} onClick={() => { setSuccessOrder(order); setCurrentScreen('order_details'); }} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#4a5568' }}>#{order.id}</span>
                <span style={{ fontSize: '11px', color: 'var(--primary-blue)', fontWeight: 600 }}>{order.status}</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-gray)' }}>{order.date} • Clicks Pharmacy</span>
              <div style={{ display: 'flex', gap: '6px', margin: '4px 0' }}>
                {order.products.map(p => (
                  <img key={p.id} src={p.image} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '6px', border: '1px solid #e2e8f0', objectFit: 'cover' }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>R {order.total.toFixed(2)}</span>
                <ChevronRight size={16} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Order Details / Status detail screen
  function renderOrderDetailsScreen() {
    if (!successOrder) return null;

    return (
      <div className="screen-root">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-gray)' }}>Help</span>
          <h2 style={{ fontSize: '14px', fontWeight: 700 }}>Order {successOrder.id}</h2>
          <X size={18} onClick={() => setCurrentScreen('order_history')} style={{ cursor: 'pointer' }} />
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(110, 167, 59, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={32} color="var(--primary-green)" />
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-blue)' }}>Thank you for your order! We are busy processing it.</h3>
          <span style={{ fontSize: '11px', color: 'var(--text-gray)' }}>We've sent an order confirmation to your email.</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>Your order details</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {successOrder.products.map(p => (
              <div key={p.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <img src={p.image} alt={p.name} style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{p.name}</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-blue)' }}>R {p.price.toFixed(2)}</span>
                    <span style={{ fontSize: '10px', backgroundColor: '#f2f5f8', padding: '2px 6px', borderRadius: '10px' }}>Quantity: {p.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '10px', marginTop: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Total</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-blue)' }}>R {successOrder.total.toFixed(2)}</span>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
            <span style={{ fontWeight: 700 }}>Collecting from:</span>
            <span>Edgemead Store</span>
            <span style={{ color: 'var(--text-gray)' }}>50 Louis Thibault Dr, Edgemead</span>
          </div>
        </div>
      </div>
    );
  }

  // Flow 1: Login Sequence Screen
  function renderLoginFlow() {
    if (currentScreen === 'login_email') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: '#ffffff' }}>
          {/* Brand Hero */}
          <div style={{ backgroundColor: 'var(--primary-blue)', padding: '40px 24px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '28px', letterSpacing: '0.08em' }}>CLICKS</span>
              <span style={{ color: 'var(--primary-green)', fontWeight: 800, fontSize: '28px' }}>+</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 400 }}>Your health. Your way.</span>
          </div>

          {/* Form area */}
          <div style={{ flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary-blue)' }}>Sign in to your account</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-gray)', marginTop: '6px' }}>Enter your email, ClubCard or cell number to get started.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-gray)', fontWeight: 600 }}>Email / ClubCard / Cell Phone</label>
              <input
                type="text"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={{ border: '1.5px solid #cbd5e0', borderRadius: '10px', padding: '13px 14px', fontSize: '14px', outline: 'none', width: '100%', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary-blue)'}
                onBlur={(e) => e.target.style.borderColor = '#cbd5e0'}
              />
            </div>

            <button
              onClick={() => setCurrentScreen('login_password')}
              style={{ backgroundColor: 'var(--primary-blue)', color: '#ffffff', border: 'none', borderRadius: '24px', padding: '15px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', width: '100%', marginTop: '4px' }}
            >
              Continue
            </button>

            <div style={{ textAlign: 'center', marginTop: '4px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Don't have an account? </span>
              <span style={{ fontSize: '13px', color: 'var(--primary-blue)', fontWeight: 600, cursor: 'pointer' }}>Register</span>
            </div>
          </div>
        </div>
      );
    }

    if (currentScreen === 'login_password') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: '#ffffff' }}>
          {/* Brand Hero */}
          <div style={{ backgroundColor: 'var(--primary-blue)', padding: '40px 24px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '28px', letterSpacing: '0.08em' }}>CLICKS</span>
              <span style={{ color: 'var(--primary-green)', fontWeight: 800, fontSize: '28px' }}>+</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 400 }}>Your health. Your way.</span>
          </div>

          {/* Form area */}
          <div style={{ flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary-blue)' }}>Welcome back!</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-gray)', marginTop: '6px' }}>Enter your password to sign in as <strong>{loginEmail}</strong>.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-gray)', fontWeight: 600 }}>Password</label>
                <span style={{ fontSize: '12px', color: 'var(--primary-blue)', fontWeight: 600, cursor: 'pointer' }}>Forgot password?</span>
              </div>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your password"
                style={{ border: '1.5px solid #cbd5e0', borderRadius: '10px', padding: '13px 14px', fontSize: '14px', outline: 'none', width: '100%', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary-blue)'}
                onBlur={(e) => e.target.style.borderColor = '#cbd5e0'}
              />
            </div>

            <button
              onClick={handleSignInSubmit}
              style={{ backgroundColor: 'var(--primary-blue)', color: '#ffffff', border: 'none', borderRadius: '24px', padding: '15px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '4px' }}
            >
              {isSigningIn
                ? <div className="loading-spinner-circle" style={{ width: '22px', height: '22px', borderTopColor: '#ffffff' }}></div>
                : 'Sign in'
              }
            </button>

            <div style={{ textAlign: 'center', marginTop: '4px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Don't have an account? </span>
              <span style={{ fontSize: '13px', color: 'var(--primary-blue)', fontWeight: 600, cursor: 'pointer' }}>Register</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }


  function handleSignInSubmit() {
    setIsSigningIn(true);
    setTimeout(() => {
      setIsSigningIn(false);
      setIsBiometricsPopup(true);
    }, 1200);
  }

  // Flow 2 & 5: Shop tab / product list
  function renderShopLanding() {
    const products = INITIAL_PRODUCTS.filter(p => searchQuery === '' || p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <div className="screen-root--flush">
        
        {/* Set Location Bar */}
        <div onClick={() => setLocationOverlay(true)} style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-gray)' }}>Delivering to:</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-blue)' }}>{deliveryType === 'Store Collection' ? `Store: ${selectedStore.name}` : `Home: ${db.user.addresses[0].line1}`}</span>
          </div>
          <ChevronRight size={18} color="var(--primary-blue)" />
        </div>

        {/* Search bar */}
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e0', padding: '8px 12px' }}>
            <Search size={18} color="var(--text-gray)" style={{ marginRight: '8px' }} />
            <input 
              type="text" 
              placeholder="Search Products, Brands & Categories" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%' }}
            />
          </div>
        </div>

        {/* Category bubbles */}
        <div style={{ display: 'flex', gap: '8px', padding: '0 16px', overflowX: 'auto' }}>
          {['Promos', 'New', 'Skincare', 'Pharmacy', 'Appliances'].map(cat => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)}
              style={{
                backgroundColor: selectedCategory === cat ? 'var(--primary-blue)' : '#ffffff',
                color: selectedCategory === cat ? '#ffffff' : 'var(--text-dark)',
                border: '1px solid #cbd5e0',
                borderRadius: '16px',
                padding: '6px 16px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Banner inside shop */}
        <div style={{ margin: '0 16px', borderRadius: '12px', overflow: 'hidden', height: '100px', backgroundColor: '#fed7e2' }}>
          <img src="https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=300" alt="Beauty" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Product Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '0 16px 20px 16px' }}>
          {products.map(prod => (
            <div key={prod.id} onClick={() => { setSelectedProduct(prod); setCurrentScreen('product_details'); }} style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', cursor: 'pointer', position: 'relative' }}>
              <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-gray)', fontWeight: 500 }}>{prod.brand}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, height: '36px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{prod.name}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-blue)', marginTop: '4px' }}>R {prod.price.toFixed(2)}</span>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); handleAddToCart(prod); }}
                style={{ backgroundColor: 'var(--primary-green)', color: '#ffffff', border: 'none', borderRadius: '16px', padding: '6px 0', fontSize: '12px', fontWeight: 600, cursor: 'pointer', width: '100%', marginTop: '4px' }}
              >
                + Add
              </button>
            </div>
          ))}
        </div>

      </div>
    );
  }

  // Pharmacy Landing tab loader
  function renderPharmacyLanding() {
    return (
      <div className="screen-root">
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-blue)', textAlign: 'center' }}>How can Clicks Pharmacy help you today?</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <div onClick={() => runDemoFlow('shop')} style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', textAlign: 'center' }}>
            <ShoppingBag size={24} color="var(--primary-blue)" />
            <span style={{ fontSize: '11px', fontWeight: 600 }}>I need medication</span>
          </div>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', textAlign: 'center' }}>
            <Plus size={24} color="var(--primary-blue)" />
            <span style={{ fontSize: '11px', fontWeight: 600 }}>Make a booking</span>
          </div>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', textAlign: 'center' }}>
            <Phone size={24} color="var(--primary-blue)" />
            <span style={{ fontSize: '11px', fontWeight: 600 }}>I need help</span>
          </div>
        </div>

        {/* My prescriptions box (Upload flow launcher) */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1.5px dashed var(--primary-blue)', padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-gray)' }}>Your prescriptions will show up here once you have an active order.</span>
          <button onClick={() => setUploadOptionOpen(true)} style={{ backgroundColor: 'var(--primary-blue)', color: '#ffffff', border: 'none', borderRadius: '20px', padding: '10px 24px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            Add a new script
          </button>
        </div>

        {/* Tools and services grid */}
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Tools & services</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="tool-card" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Plus size={18} color="var(--primary-blue)" />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>My scripts</span>
            </div>
            <div className="tool-card" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <MessageSquare size={18} color="var(--primary-blue)" />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Pharmacy chat</span>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // Product detail view (Click & Collect & OTC flows)
  function renderProductDetailsScreen() {
    if (!selectedProduct) return null;

    return (
      <div className="screen-root" style={{ backgroundColor: '#ffffff' }}>
        <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px' }} />
        
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-gray)' }}>{selectedProduct.brand}</span>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{selectedProduct.name}</h2>
          <span style={{ fontSize: '12px', color: 'var(--text-gray)' }}>Schedule {selectedProduct.schedule} | Product ID: {selectedProduct.productId}</span>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-blue)' }}>R {selectedProduct.price.toFixed(2)}</span>
          <span style={{ color: 'var(--primary-green)', fontWeight: 600, fontSize: '13px' }}>In stock</span>
        </div>

        <p style={{ fontSize: '13px', color: '#4a5568', lineHeight: '1.5' }}>
          {selectedProduct.description}
        </p>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--text-gray)', backgroundColor: 'var(--bg-gray)', padding: '10px', borderRadius: '8px' }}>
            <Info size={16} />
            <span>Dispensed by a pharmacist. Subject to pharmacist approval.</span>
          </div>
          <button 
            onClick={() => { handleAddToCart(selectedProduct); setCurrentScreen(activeTab === 'Pharmacy' ? 'pharmacy_landing' : 'shop_landing'); }}
            style={{ backgroundColor: 'var(--primary-green)', color: '#ffffff', border: 'none', borderRadius: '24px', padding: '14px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
          >
            Add to cart
          </button>
        </div>
      </div>
    );
  }

  // Flow 2: Cart Page View
  function renderCartView() {
    if (cartItems.length === 0) {
      return (
        <div className="screen-root--fill" style={{ alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '40px 20px' }}>
          <ShoppingCart size={48} color="var(--text-gray)" />
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-gray)' }}>Your cart is empty.</span>
          <button onClick={() => runDemoFlow('shop')} style={{ backgroundColor: 'var(--primary-blue)', color: '#ffffff', border: 'none', borderRadius: '20px', padding: '10px 24px', fontSize: '13px', fontWeight: 600 }}>
            Start Shopping
          </button>
        </div>
      );
    }

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
      <div className="screen-root">
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-blue)' }}>Over-the-counter Cart</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          {cartItems.map(item => (
            <div key={item.id} style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>{item.name}</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-blue)' }}>R {item.price.toFixed(2)}</span>
                  
                  {/* Quantity adjusters */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e0', borderRadius: '14px', overflow: 'hidden' }}>
                    <button onClick={() => handleUpdateQuantity(item.id, -1)} style={{ width: '24px', height: '24px', border: 'none', background: 'none', cursor: 'pointer' }}>-</button>
                    <span style={{ padding: '0 8px', fontSize: '12px', fontWeight: 600 }}>{item.quantity}</span>
                    <button onClick={() => handleUpdateQuantity(item.id, 1)} style={{ width: '24px', height: '24px', border: 'none', background: 'none', cursor: 'pointer' }}>+</button>
                  </div>
                </div>
              </div>
              <button onClick={() => handleRemoveFromCart(item.id)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={18} color="var(--text-gray)" />
              </button>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Subtotal</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-blue)' }}>R {subtotal.toFixed(2)}</span>
          </div>

          <button 
            onClick={handleCartCheckoutStart}
            style={{ backgroundColor: 'var(--primary-green)', color: '#ffffff', border: 'none', borderRadius: '24px', padding: '14px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
          >
            Checkout
          </button>
        </div>
      </div>
    );
  }

  function handleCartCheckoutStart() {
    // If it's OTC flow, launch the medical questionnaire wizard
    if (cartItems.some(item => item.category === 'OTC Medication')) {
      setCurrentScreen('otc_questionnaire');
      setOtcQuestionIndex(0);
    } else {
      setCurrentScreen('checkout_details');
    }
  }

  // Flow 5: OTC Medical Questionnaire wizard
  function renderOtcQuestionnaireScreen() {
    return (
      <div className="screen-root">
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-blue)', textAlign: 'center' }}>Medical questionnaire</h2>
        <span style={{ fontSize: '12px', color: 'var(--text-gray)' }}>
          Before we can process this OTC order, please answer a few medical questions for the patient to confirm the medicine is safe.
        </span>

        {otcQuestionIndex === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>Does your basket contain any medications you have not taken before? *</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setOtcAnswers(prev => ({ ...prev, q1: 'Yes' }))}
                style={{ flex: 1, border: '1px solid var(--primary-blue)', backgroundColor: otcAnswers.q1 === 'Yes' ? 'var(--primary-blue)' : '#ffffff', color: otcAnswers.q1 === 'Yes' ? '#ffffff' : 'var(--primary-blue)', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
              >
                Yes
              </button>
              <button 
                onClick={() => setOtcAnswers(prev => ({ ...prev, q1: 'No' }))}
                style={{ flex: 1, border: '1px solid var(--primary-blue)', backgroundColor: otcAnswers.q1 === 'No' ? 'var(--primary-blue)' : '#ffffff', color: otcAnswers.q1 === 'No' ? '#ffffff' : 'var(--primary-blue)', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
              >
                No
              </button>
            </div>
          </div>
        )}

        {otcQuestionIndex === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>Do you have any pre-existing conditions or are there any medical conditions we should know about? *</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setOtcAnswers(prev => ({ ...prev, q2: 'Yes' }))}
                style={{ flex: 1, border: '1px solid var(--primary-blue)', backgroundColor: otcAnswers.q2 === 'Yes' ? 'var(--primary-blue)' : '#ffffff', color: otcAnswers.q2 === 'Yes' ? '#ffffff' : 'var(--primary-blue)', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
              >
                Yes
              </button>
              <button 
                onClick={() => setOtcAnswers(prev => ({ ...prev, q2: 'No' }))}
                style={{ flex: 1, border: '1px solid var(--primary-blue)', backgroundColor: otcAnswers.q2 === 'No' ? 'var(--primary-blue)' : '#ffffff', color: otcAnswers.q2 === 'No' ? '#ffffff' : 'var(--primary-blue)', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
              >
                No
              </button>
            </div>
            {otcAnswers.q2 === 'Yes' && (
              <input 
                type="text" 
                value={otcAnswers.q2Text} 
                onChange={(e) => setOtcAnswers(prev => ({ ...prev, q2Text: e.target.value }))}
                placeholder="Please specify (e.g. pregnancy, high blood pressure)"
                style={{ border: '1px solid #cbd5e0', padding: '10px', borderRadius: '8px', fontSize: '13px' }}
              />
            )}
          </div>
        )}

        {otcQuestionIndex === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>Are you currently taking any other medication? *</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setOtcAnswers(prev => ({ ...prev, q3: 'Yes' }))}
                style={{ flex: 1, border: '1px solid var(--primary-blue)', backgroundColor: otcAnswers.q3 === 'Yes' ? 'var(--primary-blue)' : '#ffffff', color: otcAnswers.q3 === 'Yes' ? '#ffffff' : 'var(--primary-blue)', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
              >
                Yes
              </button>
              <button 
                onClick={() => setOtcAnswers(prev => ({ ...prev, q3: 'No' }))}
                style={{ flex: 1, border: '1px solid var(--primary-blue)', backgroundColor: otcAnswers.q3 === 'No' ? 'var(--primary-blue)' : '#ffffff', color: otcAnswers.q3 === 'No' ? '#ffffff' : 'var(--primary-blue)', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
              >
                No
              </button>
            </div>
            {otcAnswers.q3 === 'Yes' && (
              <input 
                type="text" 
                value={otcAnswers.q3Text} 
                onChange={(e) => setOtcAnswers(prev => ({ ...prev, q3Text: e.target.value }))}
                placeholder="If yes, please specify which ones"
                style={{ border: '1px solid #cbd5e0', padding: '10px', borderRadius: '8px', fontSize: '13px' }}
              />
            )}
          </div>
        )}

        {otcQuestionIndex === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>What symptoms or conditions are you using the medication you are ordering for? *</label>
            <input 
              type="text" 
              value={otcAnswers.q5} 
              onChange={(e) => setOtcAnswers(prev => ({ ...prev, q5: e.target.value }))}
              placeholder="Please specify symptoms..."
              style={{ border: '1px solid #cbd5e0', padding: '10px', borderRadius: '8px', fontSize: '13px' }}
            />
          </div>
        )}

        <button 
          onClick={handleOtcQuestionNext}
          style={{ backgroundColor: 'var(--primary-blue)', color: '#ffffff', border: 'none', borderRadius: '24px', padding: '12px', fontWeight: 600, fontSize: '13px', marginTop: '20px', cursor: 'pointer' }}
        >
          Continue
        </button>
      </div>
    );
  }

  function handleOtcQuestionNext() {
    if (otcQuestionIndex < 3) {
      setOtcQuestionIndex(prev => prev + 1);
    } else {
      setCurrentScreen('checkout_details');
    }
  }

  // Checkout Details screen (Delivery options + patient details selection)
  function renderCheckoutDetailsScreen() {
    return (
      <div className="screen-root">
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-blue)' }}>How would you like to get your medication order?</h2>
        <div style={{ display: 'flex', gap: '8px', backgroundColor: '#e2e8f0', padding: '4px', borderRadius: '8px' }}>
          <button 
            onClick={() => setDeliveryType('Delivery')}
            style={{ flex: 1, backgroundColor: deliveryType === 'Delivery' ? '#ffffff' : 'transparent', border: 'none', borderRadius: '6px', padding: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
          >
            Delivery
          </button>
          <button 
            onClick={() => setDeliveryType('Store Collection')}
            style={{ flex: 1, backgroundColor: deliveryType === 'Store Collection' ? '#ffffff' : 'transparent', border: 'none', borderRadius: '6px', padding: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
          >
            Store Collection
          </button>
        </div>

        {deliveryType === 'Store Collection' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600 }}>Collection Store</label>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e0', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{selectedStore.name}</span>
                <div style={{ fontSize: '11px', color: 'var(--text-gray)' }}>{selectedStore.address}</div>
              </div>
              <ChevronRight size={18} />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600 }}>Delivering to</label>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e0', padding: '12px', borderRadius: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>Home</span>
              <div style={{ fontSize: '11px', color: 'var(--text-gray)' }}>{db.user.addresses[0].line1}, {db.user.addresses[0].line2}</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-gray)' }}>Add delivery note</label>
              <input 
                type="text" 
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                style={{ border: '1px solid #cbd5e0', padding: '10px', borderRadius: '8px', fontSize: '12px' }}
              />
            </div>
          </div>
        )}

        {/* Recipient details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600 }}>Who is the medication order for?</label>
          {INITIAL_DEPENDENTS.map(dep => (
            <div 
              key={dep.id} 
              onClick={() => setSelectedRecipient(dep)}
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid',
                borderColor: selectedRecipient.id === dep.id ? 'var(--primary-blue)' : '#cbd5e0',
                padding: '12px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 700 }}>{dep.name}</span>
              <div style={{ fontSize: '11px', color: 'var(--text-gray)' }}>{dep.dob}</div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => setCurrentScreen('checkout_payment')}
          style={{ backgroundColor: 'var(--primary-blue)', color: '#ffffff', border: 'none', borderRadius: '24px', padding: '14px', fontWeight: 600, fontSize: '14px', marginTop: '10px', cursor: 'pointer' }}
        >
          Continue
        </button>
      </div>
    );
  }

  // Checkout Payment Selection screen (Medical aid choice, SMS / card selectors)
  function renderCheckoutPaymentScreen() {
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const total = subtotal + (deliveryType === 'Delivery' ? 35 : 0);

    return (
      <div className="screen-root">
        
        {/* Medical Aid Prompter */}
        {claimMedicalAid === null ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid #cbd5e0', borderRadius: '12px', padding: '16px', backgroundColor: '#ffffff' }}>
            <span style={{ fontSize: '13px', fontWeight: 700 }}>Do you want to claim from medical aid for this order?</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setClaimMedicalAid(true)} style={{ flex: 1, backgroundColor: 'var(--primary-blue)', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Yes</button>
              <button onClick={() => setClaimMedicalAid(false)} style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid var(--primary-blue)', color: 'var(--primary-blue)', padding: '10px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>No</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700 }}>How would you like to pay?</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Payment selection boxes */}
              <div 
                onClick={() => setPaymentOption('Prepay with SMS payment link')}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid',
                  borderColor: paymentOption === 'Prepay with SMS payment link' ? 'var(--primary-blue)' : '#cbd5e0',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 700 }}>Prepay with SMS payment link</span>
                <div style={{ fontSize: '10px', color: 'var(--text-gray)', marginTop: '2px' }}>We will send you a secure link once processing completes.</div>
              </div>

              <div 
                onClick={() => setPaymentOption('Pay with card on delivery')}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid',
                  borderColor: paymentOption === 'Pay with card on delivery' ? 'var(--primary-blue)' : '#cbd5e0',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 700 }}>Pay with card on delivery</span>
                <div style={{ fontSize: '10px', color: 'var(--text-gray)', marginTop: '2px' }}>Only card payments are accepted on delivery.</div>
              </div>

              {/* Credit card simulator wrapper */}
              <div 
                onClick={() => setPaymentOption('PayU Credit Card')}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid',
                  borderColor: paymentOption === 'PayU Credit Card' ? 'var(--primary-blue)' : '#cbd5e0',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 700 }}>Credit card (PayU secure)</span>
                <div style={{ fontSize: '10px', color: 'var(--text-gray)', marginTop: '2px' }}>Submit payment immediately via PayU portal.</div>
              </div>
            </div>

            {/* Medical Aid Details inputs if selected Yes */}
            {claimMedicalAid && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid #cbd5e0', borderRadius: '12px', padding: '16px', backgroundColor: '#ffffff', marginTop: '10px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 700 }}>Add medical aid details</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', color: 'var(--text-gray)' }}>Medical aid scheme *</label>
                  <input type="text" value={medicalAidScheme} onChange={(e) => setMedicalAidScheme(e.target.value)} style={{ border: '1px solid #cbd5e0', padding: '8px', borderRadius: '6px', fontSize: '12px' }} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', color: 'var(--text-gray)' }}>Dependent code *</label>
                  <input type="text" value={medicalAidDepCode} onChange={(e) => setMedicalAidDepCode(e.target.value)} style={{ border: '1px solid #cbd5e0', padding: '8px', borderRadius: '6px', fontSize: '12px' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', color: 'var(--text-gray)' }}>Membership number *</label>
                  <input type="text" value={medicalAidMemberNum} onChange={(e) => setMedicalAidMemberNum(e.target.value)} style={{ border: '1px solid #cbd5e0', padding: '8px', borderRadius: '6px', fontSize: '12px' }} />
                </div>
              </div>
            )}

            {/* Summary */}
            <div style={{ borderTop: '1px solid #cbd5e0', paddingTop: '10px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>Subtotal</span>
                <span>R {subtotal.toFixed(2)}</span>
              </div>
              {deliveryType === 'Delivery' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>Delivery fee</span>
                  <span>R 35.00</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginTop: '4px' }}>
                <span>Total</span>
                <span>R {total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handleFinalizePaymentAndCheckout}
              style={{ backgroundColor: 'var(--primary-blue)', color: '#ffffff', border: 'none', borderRadius: '24px', padding: '14px', fontWeight: 600, fontSize: '14px', marginTop: '10px', cursor: 'pointer' }}
            >
              {paymentOption === 'PayU Credit Card' ? 'Continue with credit card' : 'Submit Medication Order'}
            </button>
          </div>
        )}

      </div>
    );
  }

  function handleFinalizePaymentAndCheckout() {
    if (paymentOption === 'PayU Credit Card') {
      setCurrentScreen('payu_form');
    } else {
      handleOrderSubmission('Over-the-Counter');
    }
  }

  // Flow 3: PayU Secure Credit Card portal simulator
  function renderPayUFormScreen() {
    const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0) + (deliveryType === 'Delivery' ? 35 : 0);

    return (
      <div className="screen-root--fill" style={{ gap: '20px', padding: '30px 20px', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: 'var(--primary-blue)', fontWeight: 800, fontSize: '18px' }}>CLICKS</span>
            <span style={{ color: 'var(--primary-green)', fontWeight: 800, fontSize: '18px' }}>+</span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-gray)' }}>PayU secure</span>
        </div>

        <div style={{ backgroundColor: 'var(--bg-gray)', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700 }}>
            <span>Amount Due</span>
            <span style={{ color: 'var(--primary-blue)' }}>R {total.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-gray)' }}>Card number</label>
            <input type="text" placeholder="4111 1111 1111 1111" style={{ border: '1px solid #cbd5e0', padding: '10px', borderRadius: '8px', fontSize: '13px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-gray)' }}>Card holder name</label>
            <input type="text" placeholder="Aditya Khan" style={{ border: '1px solid #cbd5e0', padding: '10px', borderRadius: '8px', fontSize: '13px' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-gray)' }}>Expiry MM</label>
              <input type="text" placeholder="12" style={{ border: '1px solid #cbd5e0', padding: '10px', borderRadius: '8px', fontSize: '13px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-gray)' }}>Expiry YY</label>
              <input type="text" placeholder="28" style={{ border: '1px solid #cbd5e0', padding: '10px', borderRadius: '8px', fontSize: '13px' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
          <button 
            onClick={() => handleOrderSubmission('Shopping')} 
            style={{ backgroundColor: 'var(--primary-blue)', color: '#ffffff', border: 'none', borderRadius: '24px', padding: '14px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
          >
            Save and pay
          </button>
          <button 
            onClick={() => setCurrentScreen('payment_cancelled')} 
            style={{ backgroundColor: 'transparent', border: '1px solid var(--text-gray)', color: 'var(--text-gray)', borderRadius: '24px', padding: '12px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Payment Cancelled redirect screen
  function renderPaymentCancelledScreen() {
    return (
      <div className="screen-root--fill" style={{ alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '40px 20px', backgroundColor: '#ffffff', textAlign: 'center' }}>
        <AlertCircle size={48} color="#e53e3e" />
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-blue)' }}>Your transaction was successfully cancelled.</h3>
        <span style={{ fontSize: '12px', color: 'var(--text-gray)' }}>You will be redirected shortly. If you are not redirected, click below.</span>
        <button onClick={() => setCurrentScreen('checkout_payment')} style={{ backgroundColor: 'var(--primary-blue)', color: '#ffffff', border: 'none', borderRadius: '20px', padding: '10px 24px', fontSize: '13px', fontWeight: 600 }}>
          Go Back
        </button>
      </div>
    );
  }

  // Flow 4: Script Upload recipient step
  function renderScriptRecipientScreen() {
    return (
      <div className="screen-root">
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-blue)', textAlign: 'center' }}>Who is the script for?</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {INITIAL_DEPENDENTS.map(dep => (
            <div 
              key={dep.id} 
              onClick={() => setSelectedRecipient(dep)}
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid',
                borderColor: selectedRecipient.id === dep.id ? 'var(--primary-blue)' : '#cbd5e0',
                padding: '16px',
                borderRadius: '12px',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 700 }}>{dep.name}</span>
            </div>
          ))}
        </div>

        <button 
          onClick={() => setCurrentScreen('script_medical_info')}
          style={{ backgroundColor: 'var(--primary-blue)', color: '#ffffff', border: 'none', borderRadius: '24px', padding: '14px', fontWeight: 600, fontSize: '14px', marginTop: '20px', cursor: 'pointer' }}
        >
          Continue
        </button>
      </div>
    );
  }

  // Script Upload Medical Info step
  function renderScriptMedicalInfoScreen() {
    return (
      <div className="screen-root">
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-blue)', textAlign: 'center' }}>Your medical information</h2>
        
        {/* Generic Substitutions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Do you want to accept generic substitutions for this script?</span>
            <Info size={16} color="var(--primary-blue)" style={{ cursor: 'pointer' }} onClick={() => setIsGenericTooltip(true)} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setScriptInfo(prev => ({ ...prev, acceptGeneric: 'Yes' }))}
              style={{ flex: 1, backgroundColor: scriptInfo.acceptGeneric === 'Yes' ? 'var(--primary-blue)' : '#ffffff', color: scriptInfo.acceptGeneric === 'Yes' ? '#ffffff' : 'var(--primary-blue)', border: '1px solid var(--primary-blue)', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}
            >
              Yes
            </button>
            <button 
              onClick={() => setScriptInfo(prev => ({ ...prev, acceptGeneric: 'No' }))}
              style={{ flex: 1, backgroundColor: scriptInfo.acceptGeneric === 'No' ? 'var(--primary-blue)' : '#ffffff', color: scriptInfo.acceptGeneric === 'No' ? '#ffffff' : 'var(--primary-blue)', border: '1px solid var(--primary-blue)', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}
            >
              No
            </button>
          </div>
        </div>

        {/* Allergies */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600 }}>Do you have any allergies?</label>
          <input 
            type="text" 
            value={scriptInfo.allergies} 
            onChange={(e) => setScriptInfo(prev => ({ ...prev, allergies: e.target.value }))}
            style={{ border: '1px solid #cbd5e0', padding: '10px', borderRadius: '8px', fontSize: '13px' }}
          />
        </div>

        {/* Special Instructions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600 }}>Do you want to add any specific instructions for your pharmacist?</label>
          <input 
            type="text" 
            value={scriptInfo.instructions} 
            onChange={(e) => setScriptInfo(prev => ({ ...prev, instructions: e.target.value }))}
            style={{ border: '1px solid #cbd5e0', padding: '10px', borderRadius: '8px', fontSize: '13px' }}
          />
        </div>

        {/* Process Repeats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600 }}>If your script includes repeats, would you like us to automatically process repeats and notify you when ready?</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setScriptInfo(prev => ({ ...prev, processRepeats: 'Yes' }))}
              style={{ flex: 1, backgroundColor: scriptInfo.processRepeats === 'Yes' ? 'var(--primary-blue)' : '#ffffff', color: scriptInfo.processRepeats === 'Yes' ? '#ffffff' : 'var(--primary-blue)', border: '1px solid var(--primary-blue)', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}
            >
              Yes
            </button>
            <button 
              onClick={() => setScriptInfo(prev => ({ ...prev, processRepeats: 'No' }))}
              style={{ flex: 1, backgroundColor: scriptInfo.processRepeats === 'No' ? 'var(--primary-blue)' : '#ffffff', color: scriptInfo.processRepeats === 'No' ? '#ffffff' : 'var(--primary-blue)', border: '1px solid var(--primary-blue)', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}
            >
              No
            </button>
          </div>
        </div>

        <button 
          onClick={() => setCurrentScreen('script_medical_aid')}
          style={{ backgroundColor: 'var(--primary-blue)', color: '#ffffff', border: 'none', borderRadius: '24px', padding: '14px', fontWeight: 600, fontSize: '14px', marginTop: '10px', cursor: 'pointer' }}
        >
          Continue
        </button>
      </div>
    );
  }

  // Script Medical Aid selection screen
  function renderScriptMedicalAidScreen() {
    return (
      <div className="screen-root">
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-blue)', textAlign: 'center' }}>Do you want to claim from medical aid for this order?</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={() => { setClaimMedicalAid(true); setCurrentScreen('script_prepayment'); }}
            style={{ backgroundColor: 'var(--primary-blue)', color: '#ffffff', border: 'none', borderRadius: '24px', padding: '14px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
          >
            Yes, claim from medical aid
          </button>
          <button 
            onClick={() => { setClaimMedicalAid(false); setCurrentScreen('script_prepayment'); }}
            style={{ backgroundColor: 'transparent', border: '1px solid var(--primary-blue)', color: 'var(--primary-blue)', borderRadius: '24px', padding: '12px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
          >
            No, pay later
          </button>
        </div>
      </div>
    );
  }

  // Script prepayment selection screen (SMS Prepayment link choices)
  function renderScriptPrepaymentScreen() {
    return (
      <div className="screen-root">
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-blue)' }}>How would you like to pay?</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div 
            onClick={() => setPaymentOption('SMS payment link')}
            style={{ backgroundColor: '#ffffff', border: '1.5px solid var(--primary-blue)', padding: '16px', borderRadius: '12px', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '13px', fontWeight: 700 }}>Prepay with SMS payment link</span>
            <div style={{ fontSize: '11px', color: 'var(--text-gray)', marginTop: '4px' }}>We will send you a secure link once your order has been processed.</div>
          </div>
          <div 
            style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e0', padding: '16px', borderRadius: '12px', opacity: 0.6 }}
          >
            <span style={{ fontSize: '13px', fontWeight: 700 }}>Pay with card on delivery</span>
            <div style={{ fontSize: '11px', color: 'var(--text-gray)', marginTop: '4px' }}>Only card payments are accepted on delivery.</div>
          </div>
        </div>

        <button 
          onClick={() => handleOrderSubmission('Prescription')}
          style={{ backgroundColor: 'var(--primary-blue)', color: '#ffffff', border: 'none', borderRadius: '24px', padding: '14px', fontWeight: 600, fontSize: '14px', marginTop: '20px', cursor: 'pointer' }}
        >
          Submit Script Order
        </button>
      </div>
    );
  }

  // Order Submission Success page (illustrations & continue actions)
  function renderOrderSubmittedScreen() {
    if (!successOrder) return null;

    return (
      <div className="screen-root" style={{ gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ width: '20px' }}></span>
          <h2 style={{ fontSize: '14px', fontWeight: 700 }}>Order submitted!</h2>
          <X size={18} onClick={() => { setCurrentScreen('home_dashboard'); setActiveTab('MyClicks'); }} style={{ cursor: 'pointer' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center', margin: '20px 0' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'rgba(110, 167, 59, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={36} color="var(--primary-green)" />
          </div>
          
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-blue)' }}>Medication order submitted!</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-gray)' }}>RFM Reference Number: {successOrder.id}</span>
          </div>

          {/* Simulated Pharmacist illustration */}
          <div style={{ width: '120px', height: '120px', backgroundColor: '#e2f0fe', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px' }}>
            <span style={{ fontSize: '48px' }}>👨‍⚕️</span>
          </div>

          <p style={{ fontSize: '13px', color: '#4a5568', padding: '0 10px', lineHeight: '1.6' }}>
            {successOrder.type === 'Prescription' ? (
              "Please note an agent might call you to confirm the details of your profile."
            ) : (
              "Thank you for your order. We will inform you when your order is ready for collection or out for delivery."
            )}
          </p>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            onClick={() => { setCurrentScreen('home_dashboard'); setActiveTab('MyClicks'); }}
            style={{ backgroundColor: 'var(--primary-blue)', color: '#ffffff', border: 'none', borderRadius: '24px', padding: '14px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // ClubCard screen mockup
  function renderClubCardView() {
    return (
      <div className="screen-root" style={{ gap: '20px', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-blue)' }}>My ClubCard</h2>
        
        {/* Card mockup */}
        <div style={{ width: '100%', maxWidth: '320px', height: '180px', borderRadius: '16px', background: 'linear-gradient(135deg, #004b87, #002244)', boxShadow: '0 10px 20px rgba(0,0,0,0.15)', color: '#ffffff', padding: '20px', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '0.05em' }}>CLICKS</span>
            <span style={{ fontSize: '10px', opacity: 0.8 }}>CLUBCARD</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', opacity: 0.7 }}>Aditya Khan</span>
            <span style={{ fontSize: '14px', letterSpacing: '0.1em', fontWeight: 600 }}>6007 1122 3344 5566</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>Points balance: 211 pts</span>
          <span style={{ fontSize: '12px', color: 'var(--text-gray)' }}>Cashback available: R 0.00</span>
        </div>
      </div>
    );
  }

  // --- OVERLAYS AND DIALOGS ---

  function renderOverlays() {
    return (
      <>
        {/* 1. Drawer Menu Sidebar overlay */}
        {isDrawerOpen && (
          <div className="sidebar-drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
            <div className="sidebar-drawer-content" onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: '24px 20px', borderBottom: '1px solid #cbd5e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: 'var(--primary-blue)', fontWeight: 800, fontSize: '20px' }}>CLICKS</span>
                  <span style={{ color: 'var(--primary-green)', fontWeight: 800, fontSize: '20px' }}>+</span>
                </div>
                <X size={20} onClick={() => setIsDrawerOpen(false)} style={{ cursor: 'pointer' }} />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px 0' }}>
                <div onClick={() => { setIsDrawerOpen(false); runDemoFlow('shop'); }} style={{ padding: '14px 20px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Shop by department</span>
                  <ChevronRight size={16} />
                </div>
                <div onClick={() => { setIsDrawerOpen(false); setCurrentScreen('my_account'); }} style={{ padding: '14px 20px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                  <span>My account</span>
                  <ChevronRight size={16} />
                </div>
                <div onClick={() => { setIsDrawerOpen(false); setCurrentScreen('order_history'); }} style={{ padding: '14px 20px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                  <span>My orders</span>
                  <ChevronRight size={16} />
                </div>
                <div style={{ padding: '14px 20px', fontWeight: 600, cursor: 'pointer', opacity: 0.6 }}>Buy a voucher</div>
                <div style={{ padding: '14px 20px', fontWeight: 600, cursor: 'pointer', opacity: 0.6 }}>Pay bills & buy prepaid</div>
              </div>

              <div style={{ padding: '20px', borderTop: '1px solid #cbd5e0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button onClick={() => { setIsDrawerOpen(false); setIsLoggedIn(false); setCurrentScreen('login_email'); }} style={{ border: '1px solid var(--primary-blue)', color: 'var(--primary-blue)', borderRadius: '20px', padding: '10px', fontWeight: 600, background: 'none', cursor: 'pointer' }}>
                  Sign out
                </button>
                <span style={{ fontSize: '10px', color: 'var(--text-gray)', textAlign: 'center' }}>Version 9.2</span>
              </div>
            </div>
          </div>
        )}



        {/* 3. Login flow: Biometrics prompt popup */}
        {isBiometricsPopup && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', width: '85%', maxWidth: '320px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span>🔐</span>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Log in with biometrics</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-gray)' }}>Enable biometrics to sign in faster next time.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={confirmBiometricsAndSignIn} style={{ backgroundColor: 'var(--primary-blue)', color: '#ffffff', border: 'none', borderRadius: '20px', padding: '10px', fontWeight: 600, cursor: 'pointer' }}>
                  Enable biometrics
                </button>
                <button onClick={confirmBiometricsAndSignIn} style={{ backgroundColor: 'transparent', color: 'var(--text-gray)', border: 'none', padding: '8px', cursor: 'pointer', fontSize: '12px' }}>
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. Add Script: File Upload Options sheet */}
        {uploadOptionOpen && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 2000 }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '20px 20px 0 0', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Add a new script</h3>
                <X size={18} onClick={() => setUploadOptionOpen(false)} style={{ cursor: 'pointer' }} />
              </div>
              
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'space-around', padding: '10px 0' }}>
                <div onClick={startScriptUpload} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--bg-gray)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Camera size={24} color="var(--primary-blue)" />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>Take a photo</span>
                </div>

                <div onClick={startScriptUpload} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--bg-gray)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Image size={24} color="var(--primary-blue)" />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>Upload a photo</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Add Script: Photo Permissions dialog */}
        {photoPermissionOpen && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', width: '85%', maxWidth: '320px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span>📷</span>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Private Access to Photos</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-gray)' }}>Clicks requires photo permissions to select and upload your script.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={confirmPhotoPermission} style={{ backgroundColor: 'var(--primary-blue)', color: '#ffffff', border: 'none', borderRadius: '20px', padding: '10px', fontWeight: 600, cursor: 'pointer' }}>
                  Allow Access
                </button>
                <button onClick={() => setPhotoPermissionOpen(false)} style={{ backgroundColor: 'transparent', color: 'var(--text-gray)', border: 'none', padding: '8px', cursor: 'pointer', fontSize: '12px' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. Add Script: Photo library selector view */}
        {photoLibraryOpen && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px', width: '90%', height: '80%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e0', paddingBottom: '10px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Select Photo</h3>
                <X size={18} onClick={() => setPhotoLibraryOpen(false)} style={{ cursor: 'pointer' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', overflowY: 'auto', flex: 1 }}>
                
                {/* Script document mockup in the photo library */}
                <div onClick={selectPhotoFromLibrary} style={{ cursor: 'pointer', border: '2px solid var(--primary-blue)', borderRadius: '8px', overflow: 'hidden', position: 'relative', height: '100px' }}>
                  <div style={{ backgroundColor: '#ffffff', width: '100%', height: '100%', padding: '6px', fontSize: '8px', color: '#ff0000', fontWeight: 700, display: 'flex', flexFlow: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: '80%', height: '2px', backgroundColor: '#e2e8f0', marginBottom: '4px' }}></div>
                    <div style={{ width: '60%', height: '2px', backgroundColor: '#e2e8f0', marginBottom: '4px' }}></div>
                    <span>Regression S1</span>
                    <div style={{ width: '70%', height: '2px', backgroundColor: '#e2e8f0', marginTop: '4px' }}></div>
                  </div>
                </div>

                {/* generic random mockup photos */}
                <div style={{ backgroundColor: '#cbd5e0', borderRadius: '8px', height: '100px' }}></div>
                <div style={{ backgroundColor: '#cbd5e0', borderRadius: '8px', height: '100px' }}></div>
                <div style={{ backgroundColor: '#cbd5e0', borderRadius: '8px', height: '100px' }}></div>
                <div style={{ backgroundColor: '#cbd5e0', borderRadius: '8px', height: '100px' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* 7. Add Script: Uploading progress loader */}
        {isUploading && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', width: '85%', maxWidth: '320px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', border: '3px solid rgba(0,86,145,0.2)', borderTopColor: 'var(--primary-blue)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }}></div>
              <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Uploading your script</h3>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${uploadProgress}%`, backgroundColor: 'var(--primary-blue)', transition: 'width 0.15s ease' }}></div>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-gray)' }}>{uploadProgress}%</span>
            </div>
          </div>
        )}

        {/* 8. Add Script: Generic explanations tooltip */}
        {isGenericTooltip && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', width: '85%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Generic Substitutions</h3>
                <X size={18} onClick={() => setIsGenericTooltip(false)} style={{ cursor: 'pointer' }} />
              </div>
              <p style={{ fontSize: '12px', color: '#4a5568', lineHeight: '1.5' }}>
                Generic medicine is 'bio-identical' to the original brand-name medicine, which means it has exactly the same active ingredient and strength. We can substitute where a more cost-effective generic option is available.
              </p>
              <button onClick={() => setIsGenericTooltip(false)} style={{ backgroundColor: 'var(--primary-blue)', color: '#ffffff', border: 'none', borderRadius: '20px', padding: '10px', fontWeight: 600, cursor: 'pointer', marginTop: '10px' }}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* 9. Shop/Cart Location settings popup */}
        {locationOverlay && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 2000 }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '20px 20px 0 0', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '80%', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>How would you like to get your order?</h3>
                <X size={18} onClick={() => setLocationOverlay(false)} style={{ cursor: 'pointer' }} />
              </div>

              {/* Set Location selections */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {INITIAL_STORES.map(store => (
                  <div 
                    key={store.id} 
                    onClick={() => { setSelectedStore(store); setDeliveryType('Store Collection'); setLocationOverlay(false); }}
                    style={{ backgroundColor: '#f2f5f8', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>{store.name}</span>
                    <div style={{ fontSize: '10px', color: 'var(--text-gray)' }}>{store.address}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  function confirmBiometricsAndSignIn() {
    setIsBiometricsPopup(false);
    setIsLoggedIn(true);
    setCurrentFlow('home');
    setCurrentScreen('home_dashboard');
    setActiveTab('MyClicks');
  }
}
