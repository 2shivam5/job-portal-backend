export const assertRecruiterOwnsApplication = (application, recruiterId) => {
  const job = application.jobId;

  if (!job) {
    const err = new Error("Job not populated");
    err.statusCode = 500;
    throw err;
  }

  if (job.createdBy.toString() !== recruiterId.toString()) {
    const err = new Error("Forbidden: this application is not for your job");
    err.statusCode = 403;
    throw err;
  }
};
