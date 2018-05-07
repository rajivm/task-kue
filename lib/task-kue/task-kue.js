"use strict";

const TaskWorker = require('./task-worker');
const Task = require('./task');
const DEFAULT_QUEUE_TYPE = 'default';
const Queue = require('bull');
const pino = require('pino');

class TaskKue {
    constructor({ queue, queueType, logger, enableLog }) {
        if (!queue) {
            queue = new Queue(queueType || DEFAULT_QUEUE_TYPE);
        }

        if (!logger) {
            logger = pino({
                enabled: enableLog
            })
        }

        this._queueType = queueType || DEFAULT_QUEUE_TYPE;
        this._queue = queue;
        this._handlers = {};
        this._logger = logger;
        this._enableLog = enableLog;
        this._registeredTaskClasses = new Set();
    }

    queue(task) {
        let taskDetails = task._serialize();
        return this._queue.add(taskDetails, taskDetails.options);
    }

    register(taskCls) {
        taskCls._setDefaultTaskKue(this);
        this._registeredTaskClasses.add(taskCls);
    }

    buildWorker() {
        let worker = new TaskWorker({ queue: this._queue, queue_type: this._queueType, logger: this._logger, enableLog: this._enableLog });
        for (let taskCls of this._registeredTaskClasses) {
            worker.registerTask(taskCls);
        }
        return worker;
    }
}

TaskKue.Task = Task;
module.exports = TaskKue;
