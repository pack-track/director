export class CommandParser {
	command = '';
	continuous;
	
	constructor(
		public root,
		private write: (data: Buffer) => void,
		private ready = (path?: string) => {}
	) {
		setTimeout(() => this.ready());
	}
	
	parse(data: Buffer) {
		for (let byte of data) {
			const character = String.fromCharCode(byte);
			
			if (this.command || character.trim()) {
				this.command += character;
			}
			
			if (this.continuous) {
				if (this.command.endsWith('\n\n') && /^(([a-z0-9]+\-)*[a-z0-9]+(\: [a-zA-Z0-9\-\+\.\,\;\:\'\[\]\|\{\}\\]+)?\n)*\n$/.test(this.command)) {
					const parameters = { ...this.continuous.parameters };
					let offset = 0;
					
					while (offset < this.command.length - 2) {
						let end = this.command.indexOf('\n', offset);
						let name = this.command.substring(offset, this.command.indexOf(':', offset));
						
						parameters[name] = this.command.substring(offset + name.length + 2, end);
						offset = end + 1;
					}
					
					this.execute(this.continuous.controller, this.continuous.device, parameters);
					
					this.command = '';
					this.ready(this.continuous.path);
				}
			} else if (this.command == 'RS') {
				process.stderr.write('---STOP--- ');
			} else if (this.command.startsWith('RS')) {
				if (this.command.endsWith('\n')) {
					process.stderr.write(`---STOP---`);
					
					this.command = '';
					this.ready();
				} else if (this.command.length > 'RSTOP '.length) {
					process.stderr.write(`${character} `);
				}
			} else if (this.command == 'ROK') {
				process.stdout.write('+');
				
				this.command = '';
				this.ready();
			} else if (this.command.startsWith('RTP 1')) {
				if (this.command.endsWith('\n\n') && /^RTP 1(E|S|U) [0-9a-f]{6} (((([a-z0-9]+\-)*[a-z0-9]+)\/)*(([a-z0-9]+\-)*[a-z0-9]+))+\n(([a-z0-9]+\-)*[a-z0-9]+(\: [a-zA-Z0-9\-\+\.\,\;\:\'\[\]\|\{\}\\]+)?\n)*\n$/.test(this.command)) {
					const device = {
						type: this.command[5],
						id: this.command.substring(7, 13)
					};
					
					let offset = this.command.indexOf('\n');
					const path = this.command.substring(14, offset);
					
					const parameters = {};
					offset++;
					
					while (offset < this.command.length - 2) {
						let end = this.command.indexOf('\n', offset);
						let name = this.command.substring(offset, this.command.indexOf(':', offset));
						
						parameters[name] = this.command.substring(offset + name.length + 2, end);
						offset = end + 1;
					}
					
					let controller = this.root;
					
					for (let segment of path.split('/')) {
						const name = segment.replace(/-[a-z0-9]/g, match => match[1].toUpperCase());
						
						if (name in controller) {
							controller = controller[name];
						}
					}
					
					if (typeof controller == 'function') {
						this.execute(controller, device, parameters);
					} else {
						process.stderr.write(`invalid path ${path}\n`);
					}
				
					this.command = '';
					this.ready();
				}
			} else if (this.command.startsWith('RTPC 1')) {
				if (this.command.endsWith('\n\n') && /^RTPC 1(E|S|U) [0-9a-f]{6} (((([a-z0-9]+\-)*[a-z0-9]+)\/)*(([a-z0-9]+\-)*[a-z0-9]+))+\n(([a-z0-9]+\-)*[a-z0-9]+(\: [a-zA-Z0-9\-\+\.\,\;\:\'\[\]\|\{\}\\]+)?\n)*\n$/.test(this.command)) {
					const device = {
						type: this.command[6],
						id: this.command.substring(8, 14)
					};
					
					let offset = this.command.indexOf('\n');
					const path = this.command.substring(15, offset);
					
					const parameters = {};
					offset++;
					
					while (offset < this.command.length - 2) {
						let end = this.command.indexOf('\n', offset);
						let name = this.command.substring(offset, this.command.indexOf(':', offset));
						
						parameters[name] = this.command.substring(offset + name.length + 2, end);
						offset = end + 1;
					}
					
					let controller = this.root;
					
					for (let segment of path.split('/')) {
						const name = segment.replace(/-[a-z0-9]/g, match => match[1].toUpperCase());
						
						if (name in controller) {
							controller = controller[name];
						}
					}
					
					if (typeof controller != 'function') {
						process.stderr.write(`invalid path ${path}\n`);
					}
					
					this.continuous = { 
						path,
						device, 
						controller, 
						parameters
					};
					
					process.stdout.write(`login ${device.id} on ${path}\n`);
				
					this.command = '';
					this.ready(path);
				}
			} else if (this.command.endsWith('\n\n')) {
				process.stderr.write(`invalid command ${this.command.trim()}`);
				
				this.write(Buffer.from('RSTOP invalid command\n\n'));
				
				this.command = '';
				this.ready();
			}
		}
	}
	
	execute(controller, device, parameters) {
		const response = controller(device, parameters);
		
		if (response === true) {
			this.write(Buffer.from('ROK'));
		}
	}
}