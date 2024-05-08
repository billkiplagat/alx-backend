import kue from 'kue';

const queue = kue.createQueue();

// Object containing job data
const jobData = {
  phoneNumber: '1234567890',
  message: 'Hello, this is a notification message!',
};

// Create a job in the queue
const job = queue.create('push_notification_code', jobData);

// Attach event handlers to the job
job.on('enqueue', () => console.log(`Notification job created: ${job.id}`));
job.on('complete', () => console.log('Notification job completed'));
job.on('failed', () => console.log('Notification job failed'));

// Save the job to the queue
job.save();
