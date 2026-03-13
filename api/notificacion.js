export default function handler(req, res) {
  if (req.method === 'POST') {
    const { session_id, payment_success, rnc, nombre, status, monto } = req.body;
    
    console.log('Notificación recibida de Vercel Portal:', { session_id, payment_success, rnc, nombre, status, monto });
    
    // Respondemos con los datos que CallPilot necesita para su flujo
    return res.status(200).json({ 
      status: 'success', 
      message: 'Notificación procesada correctamente',
      data: {
        rnc: rnc || "131-01314-3",
        nombre: nombre || "Carlos de la Mota",
        status_transaccion: status || (payment_success ? "Aprobado" : "Declinado"),
        monto_pagado: monto || "0.00",
        session_id: session_id || "DEMO_ILP_2026",
        payment_success: payment_success
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
