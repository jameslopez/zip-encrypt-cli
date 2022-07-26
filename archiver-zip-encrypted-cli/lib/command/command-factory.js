"use strict";

const { EncryptPackageCommand } = require("./encrypt-package-command.js");

const COMMAND_MAP = new Map();
COMMAND_MAP.set("encrypt", EncryptPackageCommand);

class CommandFactory {
	constructor(target, password) {
		this.target = target;
		this.password = password;
	}

	getCommand(commandName) {
		const CommandClass = COMMAND_MAP.get(commandName);
		if (CommandClass) {
			return new CommandClass(this.target, this.password);
		}
		return null;
	}
}
module.exports.CommandFactory = CommandFactory;