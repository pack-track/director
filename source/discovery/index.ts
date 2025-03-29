import { createSocket } from "dgram";
import { Logger } from "../shared/log.js";
import { Message } from "@packtrack/protocol";
import { Device } from "@packtrack/layout";

export class Discovery {
	static readonly listeningAddress = 142;

	static acceptConnections(devices: Device[]) {
		const logger = new Logger('discovery');
		const server = createSocket('udp4');

		server.on('listening', () => {
			logger.log(`service discovery listening for broadcasts to ${server.address().address}:${this.listeningAddress}`);
		});

		server.on('message', (data, remote) => {
			const requestLogger = logger.child(`${remote.address}:${remote.port}`);
			requestLogger.log(`service discovery request received`);

			// only login requests should be handled
			try {
				const request = Message.from(data);

				if (!request.routes('login')) {
					throw new Error(`Invalid login route: ${request.route}`);
				}

				const deviceIdentifier = request.headers.device;

				if (!deviceIdentifier) {
					throw new Error('No device identifier supplied in login request');
				}

				const device = devices.find(device => device.identifier == deviceIdentifier);

				if (!device) {
					throw new Error(`Device '${deviceIdentifier}' is not registered in layout`);
				}

				device.lastDiscovery = {
					date: new Date(),
					address: remote.address
				};

				requestLogger.log(`login from ${deviceIdentifier}`);

				const response = new Message(['connect'], {
					version: '1'
				});

				server.send(response.toBuffer(), remote.port, remote.address, error => {
					if (error) {
						requestLogger.error('invitation could not be sent', error);
					} else {
						requestLogger.log('invitation sent');
					}
				});
			} catch (error) {
				requestLogger.warn(`invalid service discovery request`, error);
			}
		});

		server.bind(this.listeningAddress);
	}
}
