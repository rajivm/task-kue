"use strict";

var util = require('util');

module.exports = class Task {
	run() {
		throw new Error("Task.run should be overridden.")
	}

	queue(queue, processType) {
		if (!queue) {
			queue = require('kue').createQueue();
		}
		if (!processType) {
			processType = "default";
		}
		return queue.create(processType, this._serialize());
	}

	_serialize() {
		return {
			task: this,
			type: this.constructor._jobType()
		};
	}

	static _deserialize(data) {
		var task = new this();
		Object.keys(data.task).forEach(function(key) {
			task[key] = data.task[key];
		});
		return task;
	}

	static _jobType() {
		return util.format("Task.%s", this.prototype.constructor.name);
	}
}
