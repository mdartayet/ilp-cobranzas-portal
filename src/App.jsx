import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  LayoutDashboard, 
  History, 
  Settings, 
  CreditCard, 
  TrendingDown, 
  AlertCircle,
  Bell,
  ArrowRight,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { invoicesData } from './data';
import ilpLogo from './assets/logo-ilp.png';
import azulLogo from './assets/logo-azul.png';

function App() {
  const [view, setView] = useState('portal'); // 'portal' or 'checkout'
  const [invoices, setInvoices] = useState(invoicesData);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showPaymentLink, setShowPaymentLink] = useState(false);
  const [paymentPreset, setPaymentPreset] = useState('success'); // 'success' or 'error'

  const mockCards = {
    success: {
      number: '4111 1111 1111 1111',
      expiry: '12/26',
      cvv: '123',
      name: 'CARLOS DE LA MOTA (VISA - ÉXITO)'
    },
    error: {
      number: '5412 7500 0000 0000',
      expiry: '12/26',
      cvv: '123',
      name: 'CARLOS DE LA MOTA (MC - FALLO)'
    }
  };

  // Helper to calculate days difference
  const getDaysDiff = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateStr);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const categorizedInvoices = useMemo(() => {
    return invoices.map(inv => {
      const daysDiff = getDaysDiff(inv.dueDate);
      let type = 'pending';
      let discount = 0;

      if (daysDiff < 0) {
        type = 'overdue';
      } else if (daysDiff <= 5) {
        type = 'reminder';
      } else if (daysDiff >= 15) {
        type = 'discount';
        discount = 0.02; // 2%
      }

      return { ...inv, daysDiff, type, discount };
    });
  }, [invoices]);

  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const isAllSelected = selectedIds.length === categorizedInvoices.length && categorizedInvoices.length > 0;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(categorizedInvoices.map(inv => inv.id));
    }
  };

  const selectedInvoices = categorizedInvoices.filter(inv => selectedIds.includes(inv.id));
  
  const statementTotal = categorizedInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const subtotal = selectedInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalDiscount = selectedInvoices.reduce((sum, inv) => sum + (inv.amount * inv.discount), 0);
  const total = subtotal - totalDiscount;

  const handleGenerateLink = () => {
    setShowPaymentLink(true);
  };

  const notifyPaymentStatus = async (status) => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session') || 'DEMO_ILP_2026'; 
    const phone = urlParams.get('phone') || '593984029295'; // Teléfono dinámico desde la URL

    const payment_success = status === 'success';
    
    // Datos extendidos para el demo
    const paymentData = {
      session_id: sessionId,
      phone: phone, // Enviamos el teléfono dinámico a la API
      rnc: "131-01314-3",
      nombre: "Carlos de la Mota",
      status: payment_success ? "Aprobado" : "Declinado",
      monto: total.toFixed(2),
      payment_success: payment_success
    };

    try {
      // Notificamos a la API interna que sirve como trigger para CallPilot
      await fetch('/api/notificacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      console.log(`Workflow Triggered:`, paymentData);
    } catch (e) {
      console.error("Error disparando el workflow:", e);
    }

    if (payment_success) {
      alert('¡Transacción Exitosa! Su pago ha sido procesado.');
      setView('portal');
      setSelectedIds([]);
    } else {
      alert('Error en el pago: Fondos Insuficientes.');
    }
  };

  if (view === 'checkout') {
    return (
      <div style={{ backgroundColor: '#F4F7F9', minHeight: '100vh', padding: '2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Azul Header */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '1.5rem 2rem', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderRadius: '12px 12px 0 0',
            borderBottom: '4px solid #005696',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
          }}>
            <img src={azulLogo} alt="Azul" style={{ height: '40px' }} />
            <div style={{ color: '#005696', fontWeight: 600, fontSize: '0.9rem' }}>PAGO SEGURO AZUL</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1px', backgroundColor: '#E1E8ED', borderRadius: '0 0 12px 12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            {/* Card Content */}
            <div style={{ backgroundColor: 'white', padding: '3rem' }}>
              <h2 style={{ color: '#005696', fontSize: '1.5rem', marginBottom: '2rem', fontFamily: 'Outfit, sans-serif' }}>Información de Pago</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <button 
                    onClick={() => setPaymentPreset('success')}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: paymentPreset === 'success' ? '2px solid #005696' : '1px solid #CED4DA', background: paymentPreset === 'success' ? '#EBF8FF' : 'white', cursor: 'pointer', fontWeight: 600, color: '#005696' }}
                  >
                    ✓ Cargar Tarjeta Éxito
                  </button>
                  <button 
                    onClick={() => setPaymentPreset('error')}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: paymentPreset === 'error' ? '2px solid #E03131' : '1px solid #CED4DA', background: paymentPreset === 'error' ? '#FFF5F5' : 'white', cursor: 'pointer', fontWeight: 600, color: '#E03131' }}
                  >
                    ⚠ Cargar Tarjeta Fallo
                  </button>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#495057' }}>Número de Tarjeta</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      value={mockCards[paymentPreset].number} 
                      readOnly
                      style={{ width: '100%', padding: '1rem', border: '1px solid #CED4DA', borderRadius: '8px', fontSize: '1rem', background: '#F8F9FA' }} 
                    />
                    <CreditCard style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#ADB5BD' }} size={20} />
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#495057' }}>Expiración (MM/AA)</label>
                    <input 
                      type="text" 
                      value={mockCards[paymentPreset].expiry} 
                      readOnly
                      style={{ width: '100%', padding: '1rem', border: '1px solid #CED4DA', borderRadius: '8px', background: '#F8F9FA' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#495057' }}>CVV</label>
                    <input 
                      type="text" 
                      value={mockCards[paymentPreset].cvv} 
                      readOnly
                      style={{ width: '100%', padding: '1rem', border: '1px solid #CED4DA', borderRadius: '8px', background: '#F8F9FA' }} 
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#495057' }}>Titular de la Tarjeta</label>
                  <input 
                    type="text" 
                    value={mockCards[paymentPreset].name} 
                    readOnly
                    style={{ width: '100%', padding: '1rem', border: '1px solid #CED4DA', borderRadius: '8px', background: '#F8F9FA' }} 
                  />
                </div>
              </div>

              <div style={{ marginTop: '3rem', display: 'flex', gap: '1.5rem' }}>
                <button 
                  onClick={() => setView('portal')}
                  style={{ flex: 1, padding: '1.25rem', background: 'white', border: '1px solid #CED4DA', borderRadius: '8px', color: '#495057', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  Cancelar
                </button>
                <button 
                  style={{ 
                    flex: 2, 
                    padding: '1.25rem', 
                    background: paymentPreset === 'success' ? '#005696' : '#E03131', 
                    border: 'none', 
                    borderRadius: '8px', 
                    color: 'white', 
                    fontWeight: 700, 
                    fontSize: '1rem', 
                    cursor: 'pointer', 
                    boxShadow: paymentPreset === 'success' ? '0 4px 12px rgba(0, 86, 150, 0.3)' : '0 4px 12px rgba(224, 49, 49, 0.3)' 
                  }}
                  onClick={() => notifyPaymentStatus(paymentPreset)}
                >
                  {paymentPreset === 'success' ? 'Procesar Pago' : 'Simular Error'} DOP {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </button>
              </div>

              {/* Mock Cards Section */}
              <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: '#F8F9FA', borderRadius: '12px', border: '1px solid #DEE2E6' }}>
                <h4 style={{ color: '#005696', fontSize: '0.875rem', marginBottom: '1rem', borderBottom: '1px solid #CED4DA', paddingBottom: '0.5rem' }}>TARJETAS DE PRUEBA (DEMO)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#495057' }}>Visa (Éxito)</div>
                    <div style={{ color: '#6C757D' }}>4111 1111 1111 1111</div>
                    <div style={{ color: '#6C757D' }}>12/26 • 123</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#495057' }}>Mastercard (Error)</div>
                    <div style={{ color: '#6C757D' }}>5412 7500 0000 0000</div>
                    <div style={{ color: '#6C757D' }}>12/26 • 123</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Azul Summary Side */}
            <div style={{ backgroundColor: '#F8F9FA', padding: '3rem' }}>
              <h3 style={{ color: '#005696', fontSize: '1.25rem', marginBottom: '2rem', borderBottom: '1px solid #DEE2E6', paddingBottom: '1rem' }}>Resumen</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6C757D' }}>Comercio:</span>
                  <span style={{ fontWeight: 600 }}>Importadora la Plaza</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6C757D' }}>Facturas:</span>
                  <span style={{ fontWeight: 600 }}>{selectedIds.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6C757D' }}>Referencia:</span>
                  <span style={{ fontWeight: 500 }}>AZ-{Math.floor(Math.random() * 90000) + 10000}</span>
                </div>
                
                <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #DEE2E6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', color: '#005696', fontWeight: 800 }}>
                    <span>Total:</span>
                    <span>${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#ADB5BD', marginTop: '0.5rem' }}>Incluye impuestos y descuentos aplicados.</div>
                </div>
              </div>
              
              <div style={{ marginTop: '4rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', opacity: 0.6 }}>
                <img src="https://img.icons8.com/color/48/000000/visa.png" width="35" />
                <img src="https://img.icons8.com/color/48/000000/mastercard.png" width="35" />
                <img src="https://img.icons8.com/color/48/000000/amex.png" width="35" />
              </div>
              <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#ADB5BD', textAlign: 'center' }}>
                Con tecnología de Banco Popular Dominicano.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar" style={{ borderRight: '1px solid var(--border)', background: '#F8F9FA' }}>
        <div className="logo-container" style={{ 
          marginBottom: '2rem', 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <img src={ilpLogo} alt="ILP Logo" style={{ maxWidth: '100%', height: 'auto' }} />
        </div>

        <nav className="nav-links">
          <a href="#" className="nav-item">
            <LayoutDashboard size={20} />
            Inicio
          </a>
          <a href="#" className="nav-item active">
            <FileText size={20} />
            Facturas
          </a>
          <a href="#" className="nav-item">
            <History size={20} />
            Historial
          </a>
          <a href="#" className="nav-item">
            <Settings size={20} />
            Perfil
          </a>
        </nav>

        <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '1rem', background: '#E9ECEF', borderRadius: '12px' }}>
          <p style={{ fontSize: '0.75rem', color: '#6c757d' }}>Cliente</p>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#343a40' }}>CARLOS DE LA MOTA</p>
          <p style={{ fontSize: '0.7rem', color: '#6c757d' }}>C011156</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div className="header-title">
            <h1 style={{ color: '#1A1A1A' }}>IMPORTADORA LA PLAZA, S.A.S.</h1>
            <p>Estado de Cuenta - Gestión de Cobranzas Automatizada</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <button className="badge" style={{ background: '#F1F3F5', color: '#495057', border: '1px solid #DEE2E6', cursor: 'pointer' }}>
               <Bell size={14} />
             </button>
             <div className="badge badge-discount" style={{ backgroundColor: '#FFF5F5', color: '#C4121A', border: '1px solid #FFC9C9' }}>2% Descuento Activo</div>
          </div>
        </header>

        <div className="dashboard-layout">
          <div className="main-section">
            <AnimatePresence>
              {categorizedInvoices.some(inv => inv.type === 'discount' && !selectedIds.includes(inv.id)) && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="discount-banner"
                  style={{ background: 'linear-gradient(135deg, #FFF5F5 0%, #FFE3E3 100%)', border: '1px solid #FFC9C9' }}
                >
                  <div className="discount-icon" style={{ background: 'white', color: '#C4121A' }}>
                    <TrendingDown size={24} />
                  </div>
                  <div className="discount-content">
                    <h4 style={{ color: '#C4121A' }}>¡Oportunidad de Ahorro Detectada!</h4>
                    <p style={{ color: '#E03131' }}>Paga tus facturas con <strong>15 días o más</strong> de anticipación y recibe un <strong>2% de descuento automático</strong>.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="card" style={{ border: '1px solid #DEE2E6', boxShadow: 'none' }}>
              <div className="table-header">
                <h3 style={{ fontSize: '1.125rem', color: '#343a40' }}>Facturas Pendientes</h3>
                <span style={{ fontSize: '0.875rem', color: '#6c757d' }}>{categorizedInvoices.length} Facturas en total</span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input 
                        type="checkbox" 
                        className="custom-checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        style={{ borderColor: isAllSelected ? '#C4121A' : '#CED4DA' }}
                      />
                    </th>
                    <th>Factura</th>
                    <th>Fecha de Vencimiento</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'right' }}>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {categorizedInvoices.map((inv) => (
                    <tr key={inv.id} style={{ backgroundColor: selectedIds.includes(inv.id) ? '#FFF5F5' : 'transparent', borderBottom: '1px solid #F1F3F5' }}>
                      <td>
                        <input 
                          type="checkbox" 
                          className="custom-checkbox"
                          style={{ borderColor: selectedIds.includes(inv.id) ? '#C4121A' : '#CED4DA' }}
                          checked={selectedIds.includes(inv.id)}
                          onChange={() => toggleSelection(inv.id)}
                        />
                      </td>
                      <td>
                        <div className="invoice-id" style={{ color: '#343a40' }}>{inv.id}</div>
                        <div className="date">Emitida el {inv.issueDate}</div>
                      </td>
                      <td>
                        <div className="date" style={{ color: inv.daysDiff < 0 ? '#E03131' : '#495057', fontWeight: inv.daysDiff < 0 ? 600 : 400 }}>
                          {inv.dueDate}
                          {inv.daysDiff < 0 ? ` (${Math.abs(inv.daysDiff)} días vencido)` : ` (en ${inv.daysDiff} días)`}
                        </div>
                      </td>
                      <td>
                        {inv.type === 'discount' && (
                          <span className="badge badge-discount" style={{ backgroundColor: '#EBFBEE', color: '#2F9E44', border: '1px solid #D3F9D8' }}>
                            <TrendingDown size={12} /> Descuento 2%
                          </span>
                        )}
                        {inv.type === 'reminder' && (
                          <span className="badge badge-reminder" style={{ backgroundColor: '#FFF9DB', color: '#F08C00', border: '1px solid #FFE066' }}>
                            <AlertCircle size={12} /> Por Vencer
                          </span>
                        )}
                        {inv.type === 'overdue' && (
                          <span className="badge badge-overdue" style={{ backgroundColor: '#FFF5F5', color: '#E03131', border: '1px solid #FFC9C9' }}>
                            <AlertCircle size={12} /> Vencida - Pago Inmediato
                          </span>
                        )}
                        {inv.type === 'pending' && (
                          <span className="badge" style={{background: '#F1F3F5', color: '#6C757D'}}>
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="amount" style={{ color: '#343a40' }}>${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        {inv.discount > 0 && selectedIds.includes(inv.id) && (
                          <div style={{ fontSize: '0.75rem', color: '#C4121A', fontWeight: 700 }}>
                            -${(inv.amount * inv.discount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ahorro
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="summary-section">
            <div className="summary-panel" style={{ border: '1px solid #DEE2E6', boxShadow: 'none', background: '#F8F9FA' }}>
              <h3 className="summary-title" style={{ color: '#343a40' }}>Resumen de Pago</h3>
              
              <div className="summary-details">
                <div className="summary-row">
                  <span>Total Estado de Cuenta</span>
                  <span style={{ fontWeight: 700 }}>${statementTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="summary-row">
                  <span>Facturas seleccionadas</span>
                  <span>{selectedIds.length}</span>
                </div>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="summary-row">
                  <span>Descuento Aplicado</span>
                  <span style={{ color: '#C4121A', fontWeight: 600 }}>
                    -${totalDiscount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="summary-total" style={{ borderTop: '2px solid #DEE2E6', color: '#C4121A' }}>
                  <span>Total a Pagar</span>
                  <span>${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <button 
                  className="btn-pay" 
                  disabled={selectedIds.length === 0}
                  onClick={handleGenerateLink}
                  style={{ background: '#C4121A', boxShadow: selectedIds.length > 0 ? '0 4px 12px rgba(196, 18, 26, 0.2)' : 'none' }}
                >
                  <ArrowRight size={18} />
                  Generar Link de Pago
                </button>
              </div>

              {selectedIds.length === 0 && (
                <p style={{ fontSize: '0.75rem', color: '#6c757d', textAlign: 'center', marginTop: '1rem' }}>
                  Elige las facturas que deseas pagar hoy.
                </p>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Payment Link Modal */}
      <AnimatePresence>
        {showPaymentLink && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 100,
            backdropFilter: 'blur(4px)'
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card"
              style={{ maxWidth: '450px', width: '100%', padding: '2.5rem', textAlign: 'center', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}
            >
              <div style={{ 
                width: '64px', 
                height: '64px', 
                backgroundColor: '#EBFBEE', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#2F9E44',
                margin: '0 auto 1.5rem'
              }}>
                <CheckCircle2 size={32} />
              </div>
              <h2 style={{ marginBottom: '0.5rem', color: '#343a40' }}>Link Generado Exitosamente</h2>
              <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
                Tu enlace seguro de pago para <strong>${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> está listo.
              </p>
              
              <div style={{ 
                backgroundColor: '#F8F9FA', 
                padding: '1rem', 
                borderRadius: '12px', 
                border: '1px solid #DEE2E6',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '2rem',
                fontSize: '0.875rem'
              }}>
                <code style={{ flex: 1, textAlign: 'left', color: '#C4121A', fontWeight: 700 }}>
                  https://azul.ilp.com/checkout/AZ-{Math.floor(Math.random() * 900000)}
                </code>
                <ExternalLink size={16} color="#ADB5BD" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button 
                  className="btn-pay" 
                  style={{ background: '#E9ECEF', color: '#495057', marginTop: 0 }}
                  onClick={() => setShowPaymentLink(false)}
                >
                  Cerrar
                </button>
                <button 
                  className="btn-pay" 
                  style={{ marginTop: 0, background: '#C4121A' }}
                  onClick={() => { setShowPaymentLink(false); setView('checkout'); }}
                >
                  Ir a Pagar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
