import kue from 'kue';

// Create a queue with Kue
const queue = kue.createQueue();

// Function to send notification
function sendNotification(phoneNumber, message) {
  console.log(
    `Sending notification to ${phoneNumber}, with message: ${message}`,
  );
}

// Process new jobs on the push_notification_code queue
queue.process('push_notification_code', (job, done) => {
  const { phoneNumber, message } = job.data;
  // Call the sendNotification function with job data
  sendNotification(phoneNumber, message);
  // Mark the job as completed
  done();
});
