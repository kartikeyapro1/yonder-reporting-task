/**
 * instrumentation.ts
 *
 * Next.js server instrumentation hook — runs once when the server starts.
 *
 * Used to:
 * 1. Warm up the data source connection (BigQuery auth, CSV pre-load)
 * 2. Validate required environment variables at startup rather than at first request
 * 3. Register OpenTelemetry / observability tooling (future)
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const dataSource = process.env.DATA_SOURCE ?? 'csv'

  if (dataSource === 'bigquery') {
    // Validate required env vars at startup so we fail fast with a clear message
    const required = ['BIGQUERY_PROJECT', 'BIGQUERY_DATASET', 'GOOGLE_APPLICATION_CREDENTIALS']
    const missing = required.filter(k => !process.env[k])
    if (missing.length > 0) {
      throw new Error(
        `[Yonder] BigQuery data source selected but missing env vars: ${missing.join(', ')}\n` +
        `Set DATA_SOURCE=csv in .env.local for local development.`
      )
    }
    console.log('[Yonder] BigQuery data source configured — credentials loaded from', process.env.GOOGLE_APPLICATION_CREDENTIALS)
  } else {
    // Pre-warm CSV loader so the first request isn't slow
    try {
      const { getDataSource } = await import('@/lib/data/data-source')
      const ds = getDataSource()
      // Trigger module-level caching
      ds.loadTransactions()
      ds.loadExperiences()
      console.log('[Yonder] CSV data source warmed up successfully')
    } catch (err) {
      // Non-fatal in development — the data files might not be present
      console.warn('[Yonder] Could not pre-warm CSV data source:', err instanceof Error ? err.message : err)
    }
  }
}
