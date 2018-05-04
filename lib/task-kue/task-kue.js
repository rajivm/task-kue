"use strict";

const TaskWorker = require('./task-worker');
const Task = require('./task');
const DEFAULT_QUEUE_TYPE = 'default';
const Queue = require('bull');
const debug = require('debug')('task-kue')

class TaskKue {
	constructor(queue, queueType) {
		if (!queue) {
			queue = new Queue(queueType || DEFAULT_QUEUE_TYPE);
		}

		this._queueType = queueType || DEFAULT_QUEUE_TYPE;
		this._queue = queue;
		this._handlers = {};
		this._registeredTaskClasses = new Set();
	}

	queue(task) {
		let taskDetails = task._serialize();
		return this._queue.add(taskDetails, taskDetails.options);
	}

	register(taskCls) {
		debug("Task CLS", taskCls);
		taskCls._setDefaultTaskKue(this);
		this._registeredTaskClasses.add(taskCls);
		debug("Task Set", this._registeredTaskClasses.keys());
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
