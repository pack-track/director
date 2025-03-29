import { Device, Layout } from "@packtrack/layout";
import { createServer, Server, Socket } from "net";
import { Logger } from "./shared/log";
import { Message, TypedMessage, findMessageType } from "@packtrack/protocol";

type RouteHandler<MessageType extends TypedMessage> = (device: Device, message: MessageType) => void;

export class DirectorServer {
	private logger = new Logger('server');
	private connections = new Map<Device, Socket>();

	private server: Server;
	private router = new Map<typeof TypedMessage, RouteHandler<any>>();

	constructor(
		private layout: Layout
	) {
		createServer({
			noDelay: true
		}, socket => {
			socket.setTimeout(2500);
			socket.setKeepAlive(true, 2500);

			const address = socket.remoteAddress.split(':').pop();
			const device = layout.devices.find(device => device.lastDiscovery?.address == address);

			if (!device) {
				this.logger.warn('unauthenticated server connection', address);

				socket.destroy();
				return;
			}

			this.connections.set(device, socket);

			const logger = this.logger.child(device.identifier);
			logger.debug('connected');

			let buffer: Buffer = Buffer.from([]);

			socket.on('data', data => buffer = Message.dispatch(buffer, data, message => {
				logger.log('Message', message.route.join('/'));

				const type = findMessageType(message);

				if (!type) {
					logger.warn('Unknown message type', message.route);

					return;
				}

				if (!this.router.has(type)) {
					logger.warn('No route for message type', message.route);

					return;
				}

				this.router.get(type)(device, message);
			}));

			socket.on('error', error => {
				logger.error('error', error);

				this.connections.delete(device);
			});

			socket.on('close', () => {
				logger.error('close');

				this.connections.delete(device);
			});
		});
	}

	route<RouteType extends new (...args: any[]) => TypedMessage>(
		type: RouteType,
		handle: RouteHandler<InstanceType<RouteType>>
	) {
		this.router.set(type as unknown as typeof TypedMessage, handle);
	}

	start() {
		return new Promise<void>(done => this.server.listen(141, () => done()));
	}
}
