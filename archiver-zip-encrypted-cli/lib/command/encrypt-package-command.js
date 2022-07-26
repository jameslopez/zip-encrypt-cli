"use strict";

const { Command } = require("./command.js");
const log = require("loglevel");
const logResult = require("loglevel").getLogger("result");
const commandLineUsage = require("command-line-usage");
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const { PassThrough } = require("stream");
const createDefinitions = [
	{
		name: "help", alias: "h", type: Boolean,
		description: "print this message."
	}
];

class EncryptPackageCommand extends Command {
	constructor(target, password) {
		super(target, password);
		this.target = target;
		this.password = password;
		archiver.registerFormat('zip-encrypted', require("archiver-zip-encrypted"));
	}

	async _run() {
		try {
			
			let archive = archiver.create('zip-encrypted', {zlib: {level: 8}, encryptionMethod: 'zip20', password: this.password});
			//let archive = archiver('zip', {zlib: { level: 9 } });
			let outputFile = this.target + "-encrypted";

			let output = fs.createWriteStream(outputFile);
			
			
			
			await new Promise((resolve,reject)=>{
				// This event is fired when the data source is drained no matter what was the data source.
				// It is not part of this library but rather from the NodeJS Stream API.
				// @see: https://nodejs.org/api/stream.html#stream_event_end
				output.on('end', function() {
					console.log('Data has been drained');
				});
				
				// good practice to catch warnings (ie stat failures and other non-blocking errors)
				archive.on('warning', function(err) {
					if (err.code === 'ENOENT') {
					// log warning
					} else {
					// throw error
					throw err;
					}
				});
				
				// good practice to catch this error explicitly
				archive.on('error', function(err) {
					throw err;
				});
				try{
					fs.accessSync(this.target);
					// pipe archive data to the file
					archive.file(this.target, { name: this.target}).pipe(output);
					
					archive.finalize();
					
					log.debug(archive);
					log.info(`Encrypted Package ${outputFile} was created.`);
				} catch(e){
					console.error(e);
				}
				// listen for all archive data to be written
				// 'close' event is fired only when a file descriptor is involved
				output.on('close', function() {
					console.log(archive.pointer() + ' total bytes');
					console.log('archiver has been finalized and the output file descriptor has closed.');
					resolve();
				});
			
			});
			return;
		} catch (error) {
			throw new Error(`Encrypted Package ${outputFile} was not created.`);
		}
	}

	_validateArgOptions(options) {
		return true;
	}

	_getArgDefinitions() {
		return createDefinitions;
	}

	_applyArgOptions(options) {
		super._applyArgOptions(options);
		this.name = options.name;
		this.description = options.description;
	}

	_printUsage() {
		const sections = [
			{
				header: "zip-crypt create",
				content: `Creates an encrypted object migration package.`
			},
			{
				header: "Synopsis",
				content: [
					"$ zip-crypt {bold -t} {underline url} {bold -p} {underline password} {red encrypt}"
				]
			},
			{
				header: "Options",
				optionList: createDefinitions
			},
			{
				header: "Examples",
				content: [
					{
						desc: "1. Create an empty object migration package.",
						example: "$ zip-crypt -t http://tririga.dev:8001/dev -u user -p password create new_package -d \"Package description\""
					}
				]
			}
		];
		log.info(commandLineUsage(sections));
	}
}
module.exports.EncryptPackageCommand = EncryptPackageCommand;