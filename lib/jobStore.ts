export interface Job {
  status: 'processing' | 'done' | 'error'
  filePath?: string
  error?: string
  createdAt: number
}

// globalThis garante um único Map compartilhado entre todos os módulos compilados
// pelo Next.js, sobrevivendo a hot-reloads e lazy compilation de rotas.
type GlobalWithJobs = typeof globalThis & { __jobStore?: Map<string, Job> }
const g = globalThis as GlobalWithJobs
if (!g.__jobStore) g.__jobStore = new Map<string, Job>()
export const jobs: Map<string, Job> = g.__jobStore

export function cleanupOldJobs(): void {
  const oneHourAgo = Date.now() - 60 * 60 * 1000
  for (const [id, job] of jobs) {
    if (job.createdAt < oneHourAgo) {
      jobs.delete(id)
    }
  }
}
