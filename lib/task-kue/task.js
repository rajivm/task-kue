"use strict";

class Task {
	run(_job) {
		throw new Error("Task.run should be overridden.");
	}

	_serialize() {
		return {
			task: this,
			type: this.constructor._jobType()
		};
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

	static _deserialize(data) {
		var task = new this();
		Object.keys(data.task).forEach(function(key) {
			task[key] = data.task[key];
		});
		return task;
	}

	static _jobType() {
		return `Task.${this.prototype.constructor.name}`;
	}
}

module.exports = Task;
