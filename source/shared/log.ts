export class Logger {
	constructor(
		private unit: string, 
		private parent?: Logger
	) {

	}

	private get parentChain(): string[] {
		if (this.parent) {
			return [...this.parent.parentChain, this.unit];
		}

		return [this.unit];
	}

	private static color(identifier: string, text: string) {
		let color = 0;

		for (let i = 0; i < identifier.length; i++) {
			color = identifier.charCodeAt(i) + ((color << 5) - color);
		}

		return `\x1b[38;5;${Math.abs(color % 208) + 20}m${text}\x1b[39m`;
	}

	private composeHeader() {
		return `${new Date().toISOString()} ${this.parentChain.map(unit => Logger.color(unit, unit)).join(' ')}: `;
	}

	child(name: string) {
		return new Logger(name, this);
	}

	debug(...message: any[]) {
		process.stdout.write(`D ${this.composeHeader()}${message.join(' ')}\n`);
	}

	log(...message: any[]) {
		process.stdout.write(`L ${this.composeHeader()}${message.join(' ')}\n`);
	}

	warn(...message: any[]) {
		process.stdout.write(`W ${this.composeHeader()}${message.join(' ')}\n`);
	}

	error(...message: any[]) {
		process.stderr.write(`E ${this.composeHeader()}${message.join(' ')}\n`);
	}
}
