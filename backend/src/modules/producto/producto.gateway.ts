import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ProductoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {}
  handleDisconnect(client: Socket) {}

  notificarCambioMenu() {
    this.server.emit('menu_actualizado', {
      timestamp: new Date(),
      mensaje: 'El menú ha sido actualizado por la administración',
    });
  }
}