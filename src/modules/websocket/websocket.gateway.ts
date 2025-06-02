import { WebSocketGateway as NestWebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Server } from 'socket.io';

@NestWebSocketGateway({
  cors: {
    origin: '*', // In production, you would want to restrict this
  },
  // transports: ['websocket'],
})
export class WebSocketGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectPinoLogger(WebSocketGateway.name)
    private readonly logger: PinoLogger,
  ) {}

  handleConnection(client: any) {
    this.logger.info({ clientId: client.id }, 'Client connected');
  }

  handleDisconnect(client: any) {
    this.logger.info({ clientId: client.id }, 'Client disconnected');
  }

  emitToBoxRoom(boxId: string, data: any) {
    this.logger.debug({ boxId, dataKeys: Object.keys(data) }, 'Emitting data to box room');
    this.server.emit(`box:${boxId}`, data);
  }

  emitToAllBoxRoom(data: any) {
    this.logger.debug({ dataKeys: Object.keys(data) }, 'Emitting data to all box room');
    this.server.emit(`box:all`, data);
  }
} 