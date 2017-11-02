"use strict";

const KueMultiWorker = require('./kue-multi-worker');
const Task = require("./task");
const util = require("util");

class TaskWorker extends KueMultiWorker {
	registerTask(taskCls) {
		var self = this;
		super.register(taskCls._jobType(), function(job, _done) {
			return self._runTask(taskCls, job);
		});
	}

	register(type, handler) {
		if (type.prototype instanceof Task) {
			this.registerTask(type);
			return;
		}
		super.register(type, handler);
	}

	_runTask(taskCls, job) {
		var task = taskCls._deserialize(job.data);
		if (task.expireAt > new Date().getTime()) {
			// run task if no expired
			return task.run(job);
		}
		else {
			util.log(`Task Expired: - Expiration: ${task.expireAt}, Current: ${new Date().getTime()}`);
		}
	}
}

module.exports = TaskWorker;
