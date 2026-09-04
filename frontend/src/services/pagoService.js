import axios from 'axios';

const API_URL = 'http://localhost:3000';

export async function verificarPagoWebhook(datosPago, firma) {
  try {
    const response = await axios.post(`${API_URL}/pagos/webhook-nequi`, datosPago, {
      headers: { 'x-signature': firma }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      throw new Error(data.message || `Error del servidor: ${status}`);
    }
    throw new Error('Error de red o servidor no disponible');
  }
}