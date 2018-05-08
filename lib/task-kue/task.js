"use strict";

class Task {


    constructor(options) {
        const defaultOptions = {
            timeout: 7200000, // 2hours
            backoff: false, // retry logic
            removeOnComplete: true,
            removeOnFail: false
        }

        this.taskOptions = Object.assign({}, defaultOptions, options);
    }

    run(_job) {
        throw new Error("Task.run should be overridden.");
    }

    queue(taskKue) {
        taskKue = taskKue || this.constructor._taskKue;
        if (!taskKue) {
            throw new Error("No specified TaskKue or default TaskKue");
        }
        return taskKue.queue(this);
    }

    static _setDefaultTaskKue(taskKue) {
        this._taskKue = taskKue;
    }

    _serialize() {
        return {
            task: this,
            options: this.taskOptions,
            type: this.constructor._jobType()
        };
    }

    static _deserialize(data) {
        var task = new this();
        Object.keys(data.task).forEach(function (key) {
            task[key] = data.task[key];
        });
        return task;
    }

    static _jobType() {
        return `Task.${this.prototype.constructor.name}`;
    }
}

module.exports = Task;
