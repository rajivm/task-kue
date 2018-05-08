"use strict";

const DEFAULT_QUEUE_TYPE = 'default';
const Queue = require('bull');

class KueMultiWorker {
    constructor({ queue, queueType, logger, enableLog }) {
        if (!queue) {
            queue = new Queue(queueType || DEFAULT_QUEUE_TYPE);
        }
        if (!queueType) {
            queueType = DEFAULT_QUEUE_TYPE;
        }
        this._queue = queue;
        this._queueType = queueType;
        this._handlers = {};
        this._logger = logger;

        this._errorCallback = function (e, _job) {
            // noop
        };
    }

    process() {
        var self = this;
        this._queue.process(function (job, done) {
            self._processJob(job, done);
        });
    }

    register(type, handler) {
        this._handlers[type] = handler;
    }

    _processJob(job, done) {

        let jobType = job.data.type;
        if (!jobType) {
            return this._callErrorCallback(new Error("Job is missing data.type"), job, done);
        }
        let handler = this._handlers[job.data.type];
        if (!handler) {
            return this._callErrorCallback(new Error(`No handler for job type: ${jobType}`), job, done);
        }
        this._logger.info(`JOB START ${jobType}.${job.id}`);
        try {
            Promise.resolve(handler(job, done)).catch((e) => {
                this._callErrorCallback(e, job, done);
            }).then((result) => {
                this._logger.info(`JOB SUCCESS ${jobType}.${job.id}`, result);
                done();
            });
        } catch (e) {
            this._callErrorCallback(e, job, done);
        }
    }

    onError(callback) {
        this._errorCallback = callback;
    }

    _callErrorCallback(e, job, done) {
        this._logger.error(`JOB ERROR ${job.id}`, e);
        if (this._errorCallback) {
            this._errorCallback(e, job);
        }
        if (done) {
            done(e);
        }
    }
}

module.exports = KueMultiWorker;
