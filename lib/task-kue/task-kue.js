"use strict";

const TaskWorker = require('./task-worker');
const Task = require('./task');

class TaskKue {
	constructor(queue, queueType) {
		if (!queue) {
			queue = require('kue').createQueue();
		}
		if (!queueType) {
			queueType = "default";
		}
		this._queue = queue;
		this._queueType = queueType;
		this._handlers = {};
		this._registeredTaskClasses = new Set();
	}

	queue(task) {
		return this._queue.create(this._queueType, task._serialize());
	}

	register(taskCls) {
		taskCls._setDefaultTaskKue(this);
		this._registeredTaskClasses.add(taskCls);
	}

	buildWorker() {
		let worker = new TaskWorker(this._queue, this._queueType);
		for (let taskCls of this._registeredTaskClasses) {
			worker.registerTask(taskCls);
		}
		return worker;
	}
}

TaskKue.Task = Task;
module.exports = TaskKue;
