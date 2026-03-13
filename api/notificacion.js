export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { session_id, payment_success, rnc, nombre, status, monto, phone } = req.body;
    
    // Aquí configuramos el número de teléfono al que CallPilot llamará/escribirá.
    // Usamos el del ejemplo de IT por defecto, o puedes pasarlo desde el frontend.
    const targetPhone = phone || "593962206252"; 
    
    const callpilotPayload = {
        "contact_list": [
            {
                "phone": targetPhone,
                "monto_pagado": parseFloat(monto) || 0,
                "name": nombre || "Carlos de la Mota",
                "rnc": rnc || "131-01314-3",
                "status_transaccion": payment_success ? "Exitosa" : "Fallida"
            }
        ],
        "mapped_variables": {
            "nombre": "name",
            "phone": "phone",
            "name": "name",
            "rnc": "rnc",
            "status_transaccion": "status_transaccion",
            "monto_pagado": "monto_pagado"
        }
    };

    try {
      // Vercel actúa como tu servidor Backend y le dispara el webhook de CallPilot a tu equipo IT
      const apiResponse = await fetch('https://contact-center.callpilot.ai/webhook/api-outbound/upload-contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': '169955bf-8b51-4545-a4a8-f6b5dded9ac1'
        },
        body: JSON.stringify(callpilotPayload)
      });
      
      const responseText = await apiResponse.text();
      let responseData = responseText;
      try { responseData = JSON.parse(responseText); } catch(e) {}

      console.log('CallPilot API Output:', responseData);

      return res.status(200).json({ 
        status: "success",
        message: "Se disparó el Workflow de CallPilot con éxito",
        callpilot_response: responseData
      });
    } catch (error) {
      console.error('Error al contactar a CallPilot:', error);
      return res.status(500).json({ 
        status: "error",
        message: "Fallo al llamar la API resolutora de CallPilot",
        error: error.toString()
      });
    }

  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
