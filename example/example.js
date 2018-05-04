'use strict';

const util = require('util');
const TaskKue = require('../lib/task-kue');
const Task = require("../lib/task-kue/task");
const myTaskQueue = new TaskKue();

// define task template and code running logic
class EmailTask extends Task {
    constructor(email, subject, body) {
        super();
        this.email = email;
        this.subject = subject;
        this.body = body;
    }

    run() {
        return "this task is done";
        // send email logic
    }
}

// define task template and code running logic
class PdfTask extends Task {
    constructor(pdf, subject, body) {
        super({
            timeout: 1
        });
        this.pdf = pdf;
        this.subject = subject;
        this.body = body;
        this.timeout
    }

    run() {
        throw new Error("test error");
        return "this task is done for pdf";
        // send email logic
    }
}

myTaskQueue.register(EmailTask);
myTaskQueue.register(PdfTask);
// typically worker.js file
// processiing task
const worker = myTaskQueue.buildWorker();

worker.onError(function (e, job) {
    util.log(e.stack);
    process.exit();
});

worker.process();



// register a new task
new EmailTask("hello@world.com", "Test Email", "Test Body").queue();
new PdfTask("pdf pdf", "Test Email", "Test Body").queue();