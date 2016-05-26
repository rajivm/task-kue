"use strict";

const KueMultiWorker = require('./kue-multi-worker');
const Task = require("./task");

class TaskWorker extends KueMultiWorker {
	registerTask(taskCls) {
		var self = this;
		super.register(taskCls._jobType(), function(job, done) {
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
		return task.run(job);
	}
}

module.exports = TaskWorker;