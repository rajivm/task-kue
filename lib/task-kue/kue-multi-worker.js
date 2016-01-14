"use strict";

var util = require('util');

module.exports = class KueMultiWorker {
	constructor(queue, processType) {
		if (!queue) {
			queue = require('kue').createQueue();
		}
		if (!processType) {
			processType = "default";
		}
		this._queue = queue;
		this._processType = processType;
		this._handlers = {};
		this._errorCallback = function(e) {
			util.log(e);
		};
	}

	process(concurrency) {
		if (!concurrency) {
			concurrency = 1;
		}
		var self = this;
		this._queue.process(this._processType, concurrency, function(job, done) {
			self._processJob(job, done);
		});
	}

	register(type, handler) {
		this._handlers[type] = handler;
	}

	_processJob(job, done) {
		var jobType = job.data.type;
		if (!jobType) {
			return this._callErrorCallback(new Error(util.format("Job is missing data.type")), job, done);
		}
		var handler = this._handlers[job.data.type];
		if (!handler) {
			return this._callErrorCallback(new Error(util.format("No handler for job type: %s", jobType)), job, done);
		}
		util.log("Running handler for jobType: " + jobType);
		try {
			handler(job, done);
		} catch (e) {
			return this._callErrorCallback(e, job, done);
		}
	}

	onError(callback) {
		this._errorCallback = callback;
	}

	_callErrorCallback(e, job, done) {
		if (this._errorCallback) {
			this._errorCallback(e, job);
		}
		if (done) {
			done(e);
		}
	}
}
