export default function handler(req, res) {
  if (req.method === 'POST') {
    const { session_id, payment_success, amount } = req.body;
    console.log('Notificación recibida:', { session_id, payment_success, amount });
    
    // Respondemos con éxito a CallPilot
    return res.status(200).json({ 
      status: 'success', 
      message: 'Notificación procesada correctamente',
      received: { session_id, payment_success, amount }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
