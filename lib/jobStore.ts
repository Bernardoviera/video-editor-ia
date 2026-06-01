export interface Job {
  status: 'processing' | 'done' | 'error'
  filePath?: string
  error?: string
  createdAt: number
}

export const jobs = new Map<string, Job>()

export function cleanupOldJobs(): void {
  const oneHourAgo = Date.now() - 60 * 60 * 1000
  for (const [id, job] of jobs) {
    if (job.createdAt < oneHourAgo) {
      jobs.delete(id)
    }
  }
}
