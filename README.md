# Task-Kue

Task-Kue is a task queue for Node.JS that builds on the [Kue](https://github.com/Automattic/kue) priority job queue library and Redis. Task-Kue automatically serializes Task objects and queues them up for a worker process to deserialize and run.

### Create a Task queue (my-task-queue.js)
```javascript
const TaskKue = require('task-kue');
const myTaskQueue = new TaskKue();
module.exports = myTaskQueue;
```

### Define a Task Object
And register it with the task queue you defined.
```javascript
const myTaskQueue = require('my-task-queue');
const Task = require('task-kue').Task;

class EmailTask extends Task {
    constructor(email, subject, body) {
        this.email = email;
        this.subject = subject;
        this.body = body;
    }

    run() {
        return smtpPromise(this.email,this.subject, this.body);
    }
}

myTaskQueue.register(EmailTask);
```

### Create a Worker and run it
```javascript
const myTaskQueue = require('my-task-queue');

var worker = myTaskQueue.buildWorker();

worker.onError(function(e, job) {
	util.log(e.stack);
});

worker.process();
```

### Execute a task asyncronously
```javascript
new EmailTask("hello@world.com", "Test Email", "Test Body").queue().save();
```
All of the [kue](https://github.com/Automattic/kue) methods (`delay`, `priority`) are available before saving the Task.
