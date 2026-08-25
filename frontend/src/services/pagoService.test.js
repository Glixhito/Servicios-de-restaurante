import { describe, test, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { verificarPagoWebhook } from './pagoService';

vi.mock('axios');

describe('Pruebas de Integración - pagoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Debe procesar con éxito la respuesta 200 OK del backend', async () => {
    const datosValidos = { referencia: 'PED-TEST-NEQUI-2026', monto: '18000.00' };
    const respuestaMock = { exito: true, mensaje: 'Pago procesado correctamente' };

    axios.post.mockResolvedValueOnce({ data: respuestaMock });

    const resultado = await verificarPagoWebhook(datosValidos, 'firma_valida');

    expect(resultado).toEqual(respuestaMock);
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  test('Debe capturar el error 409 Conflict del backend', async () => {
    const datosDuplicados = { referencia: 'PED-TEST-NEQUI-2026', monto: '18000.00' };
    const errorBackend = {
      response: {
        status: 409,
        data: { message: 'Pago ya fue procesado. Estado: PAGADO', statusCode: 409 }
      }
    };
    axios.post.mockRejectedValueOnce(errorBackend);

    await expect(verificarPagoWebhook(datosDuplicados, 'firma_valida'))
      .rejects
      .toThrow('Pago ya fue procesado. Estado: PAGADO');
  });
});