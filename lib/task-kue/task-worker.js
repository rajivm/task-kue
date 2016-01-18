"use strict";

var util = require('util');
var KueMultiWorker = require('./kue-multi-worker')
var Task = require("./task");

module.exports = class TaskWorker extends KueMultiWorker {
	registerTask(taskCls) {
		var self = this;
		super.register(taskCls._jobType(), function(job, done) {
			return self._runTask(taskCls, job, done);
		});
	}

	register(type, handler) {
		if (type.prototype instanceof Task) {
			this.registerTask(type);
		}
		super.register(type, handler);
	}

	_runTask(taskCls, job, done) {
		var task = taskCls._deserialize(job.data);
		return done(task.run());
	}
}

