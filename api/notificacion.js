export default function handler(req, res) {
  if (req.method === 'POST') {
    const { session_id, payment_success, rnc, nombre, status, monto } = req.body;
    
    console.log('Notificación recibida de Vercel Portal:', { session_id, payment_success, rnc, nombre, status, monto });
    
    // Respondemos con nombres limpios (sin @)
    return res.status(200).json({ 
      status: "success",
      rnc: rnc || "131-01314-3",
      name: nombre || "Carlos de la Mota",
      status_transaccion: status || (payment_success ? "Aprobado" : "Declinado"),
      monto_pagado: monto || "0.00"
    });
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
