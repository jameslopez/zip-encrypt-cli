"use strict";

const commandLineArgs = require("command-line-args");

class Command {
	constructor(target, password) {
	}

	async run() {
		try {
			await this._run();
		} catch (error) {
			throw error;
		}
	}

	printHelp() {
		if (this.help) {
			this._printUsage();
		}
		return this.help;
	}
	
	parseArguments(argv) {
		let options;
		try {
			options = commandLineArgs(this._getArgDefinitions(), { argv })
		} catch (e) {
			this._printUsage();
			return false;
		}
		if (!this._validateArgOptions(options)) {
			this._printUsage();
			return false;
		}
		this._applyArgOptions(options);
		return true;
	}

	_applyArgOptions(options) {
		this.help = options.help;
	}
}
module.exports.Command = Command;