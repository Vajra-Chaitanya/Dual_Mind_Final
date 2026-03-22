import PropTypes from 'prop-types'

const formatDuration = (ms) => {
  if (ms == null) return null
  if (ms < 1000) return `${ms.toFixed(0)} ms`
  const seconds = ms / 1000
  if (seconds < 60) return `${seconds.toFixed(1)} s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds.toFixed(0)}s`
}
const hasText = (value) => typeof value === 'string' && value.trim().length > 0

const MetadataRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3 border-b border-dark-border/70 py-2 last:border-b-0">
    <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{label}</span>
    <span className="text-sm text-text-primary text-right break-all">{value}</span>
  </div>
)

MetadataRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node]),
}

MetadataRow.defaultProps = {
  value: '',
}

const executionStepPropType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape({
    step: PropTypes.number,
    tool: PropTypes.string,
    status: PropTypes.string,
    executionTime: PropTypes.number,
    purpose: PropTypes.string,
    input: PropTypes.string,
    output: PropTypes.string,
    error: PropTypes.string,
  }),
])

const ExecutionStepCard = ({ step }) => (
  <div className="rounded-lg border border-dark-border bg-dark-surface/60 p-3 backdrop-blur">
    <div className="flex items-center justify-between gap-3 text-xs text-text-secondary">
      <div className="font-semibold text-text-primary">
        {step.tool || 'Unknown tool'}
        {typeof step.step === 'number' ? ` · Step ${step.step}` : ''}
      </div>
      <span
        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${
          step.status === 'success'
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            : step.status === 'error'
              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
              : 'bg-slate-500/20 text-slate-200 border border-slate-500/40'
        }`}
      >
        {step.status || 'unknown'}
      </span>
    </div>
    {step.purpose ? (
      <p className="mt-2 text-sm text-text-secondary">
        <span className="font-medium text-text-primary">Purpose:</span> {step.purpose}
      </p>
    ) : null}
    {step.executionTime != null ? (
      <p className="mt-1 text-xs text-text-secondary">
        Runtime: <span className="text-text-primary">{formatDuration(step.executionTime)}</span>
      </p>
    ) : null}
    {step.input ? (
      <details className="mt-2 group">
        <summary className="cursor-pointer text-xs text-text-secondary hover:text-text-primary transition-colors">
          View Input
        </summary>
        <pre className="mt-2 whitespace-pre-wrap rounded-md border border-dark-border bg-dark-surface/80 p-2 text-xs text-text-secondary">
          {step.input}
        </pre>
      </details>
    ) : null}
    {step.output ? (
      <details className="mt-2 group">
        <summary className="cursor-pointer text-xs text-text-secondary hover:text-text-primary transition-colors">
          View Output
        </summary>
        <pre className="mt-2 whitespace-pre-wrap rounded-md border border-dark-border bg-dark-surface/80 p-2 text-xs text-text-primary">
          {step.output}
        </pre>
      </details>
    ) : null}
    {step.error ? (
      <div className="mt-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
        <strong className="block text-xs uppercase tracking-wide">Error</strong>
        {step.error}
      </div>
    ) : null}
  </div>
)

ExecutionStepCard.propTypes = {
  step: PropTypes.shape({
    step: PropTypes.number,
    tool: PropTypes.string,
    status: PropTypes.string,
    executionTime: PropTypes.number,
    purpose: PropTypes.string,
    input: PropTypes.string,
    output: PropTypes.string,
    error: PropTypes.string,
  }).isRequired,
}

const Section = ({ title, children }) => (
  <section className="space-y-3 rounded-lg border border-dark-border/80 bg-dark-surface/80 p-4 backdrop-blur">
    <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">{title}</h3>
    <div className="space-y-2 text-sm text-text-primary">{children}</div>
  </section>
)

Section.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}

/**
 * ExecutionDetailsPanel
 * ---------------------
 * Renders structured orchestrator metadata such as plan summaries, step logs,
 * fallback payloads, and timing information within the Execution Details tab.
 * Content is grouped into themed sections that align with the dark UI aesthetic.
 */
const ExecutionDetailsPanel = ({ details }) => {
  if (!details) {
    return (
      <div className="rounded-md border border-dark-border bg-dark-surface/70 px-4 py-3 text-sm text-text-secondary">
        No execution details available.
      </div>
    )
  }

  const planDetails = details.plan || null
  const planSummary = details.planSummary ?? null
  const planOverview =
    details.planOverview ??
    details.plan_overview ??
    planSummary ??
    (planDetails && typeof planDetails === 'object' ? planDetails.summary : null)

  const rawExecutionSteps = details.executionSteps ?? details.execution_steps ?? []
  const normalizedExecutionSteps = Array.isArray(rawExecutionSteps) ? rawExecutionSteps : []

  const expectedOutput = details.expectedOutput ?? details.expected_output ?? null
  const summaryText = details.summary ?? null
  const reasoning = details.reasoning ?? null
  const verification = details.verification ?? null
  const finalVerification = details.finalVerification ?? null
  const fallbacks = details.fallbacks ?? null
  const metadata = details.metadata ?? null

  const hasPlanOverview = hasText(planOverview)
  const hasPlanSummary = hasText(planSummary)
  const hasExecutionSteps = normalizedExecutionSteps.length > 0
  const hasExpectedOutput = hasText(expectedOutput)
  const hasSummary = hasText(summaryText)
  const hasReasoning = hasText(reasoning)
  const hasVerification = hasText(verification)
  const hasFinalVerification =
    finalVerification && typeof finalVerification === 'object' && Object.keys(finalVerification).length > 0
  const hasFallbacks = fallbacks && typeof fallbacks === 'object' && Object.keys(fallbacks).length > 0

  const metadataEntries = []
  if (metadata && typeof metadata === 'object') {
    if (metadata.status) metadataEntries.push({ label: 'Status', value: metadata.status })
    if (metadata.sessionId) metadataEntries.push({ label: 'Session', value: metadata.sessionId })
    if (metadata.executionTime != null)
      metadataEntries.push({ label: 'Runtime', value: formatDuration(metadata.executionTime) })
    if (metadata.iterations != null) metadataEntries.push({ label: 'Iterations', value: metadata.iterations })
    if (metadata.planScore != null) metadataEntries.push({ label: 'Plan Score', value: metadata.planScore })
    if (metadata.planApproved != null)
      metadataEntries.push({ label: 'Plan Approved', value: metadata.planApproved ? 'Yes' : 'No' })
    if (metadata.fallbackUsed != null)
      metadataEntries.push({ label: 'Fallback Used', value: metadata.fallbackUsed ? 'Yes' : 'No' })
    if (metadata.fallbackReason)
      metadataEntries.push({ label: 'Fallback Reason', value: metadata.fallbackReason.replace(/_/g, ' ') })
    if (metadata.fallbackSource)
      metadataEntries.push({ label: 'Fallback Source', value: metadata.fallbackSource })
    if (metadata.lightweightMode != null)
      metadataEntries.push({ label: 'Lightweight Mode', value: metadata.lightweightMode ? 'Enabled' : 'Disabled' })
    if (metadata.timestampUtc)
      metadataEntries.push({ label: 'Timestamp (UTC)', value: new Date(metadata.timestampUtc).toUTCString() })
    if (Array.isArray(metadata.fallbackPayloadKeys) && metadata.fallbackPayloadKeys.length)
      metadataEntries.push({
        label: 'Fallback Payload Keys',
        value: metadata.fallbackPayloadKeys.join(', '),
      })
  }

  const hasMetadata = metadataEntries.length > 0
  const nothingToShow =
    !hasPlanOverview &&
    !hasExecutionSteps &&
    !hasExpectedOutput &&
    !hasSummary &&
    !hasReasoning &&
    !hasVerification &&
    !hasFinalVerification &&
    !hasFallbacks &&
    !hasMetadata

  return (
    <div className="space-y-4 text-sm text-text-primary">
      {hasPlanOverview ? (
        <Section title="Plan Overview">
          <p>{planOverview}</p>
          {hasPlanSummary && planSummary !== planOverview ? (
            <p className="text-xs text-text-secondary">{planSummary}</p>
          ) : null}
          {planDetails ? (
            <details className="group">
              <summary className="cursor-pointer text-xs text-text-secondary hover:text-text-primary transition-colors">
                View Structured Plan
              </summary>
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-md border border-dark-border bg-dark-surface/70 p-3 text-xs text-text-secondary">
                {JSON.stringify(planDetails, null, 2)}
              </pre>
            </details>
          ) : null}
        </Section>
      ) : null}

      {hasExecutionSteps ? (
        <Section title="Execution Steps">
          <div className="space-y-3">
            {normalizedExecutionSteps.map((step, index) => {
              if (typeof step === 'string') {
                return (
                  <div
                    key={`step-${index}`}
                    className="rounded-lg border border-dark-border bg-dark-surface/60 p-3 text-sm text-text-primary backdrop-blur"
                  >
                    {step}
                  </div>
                )
              }

              return (
                <ExecutionStepCard
                  key={`${step.step ?? index}-${step.tool ?? 'step'}-${step.status ?? 'status'}`}
                  step={step}
                />
              )
            })}
          </div>
        </Section>
      ) : null}

      {hasExpectedOutput ? (
        <Section title="Expected Output">
          <p>{expectedOutput}</p>
        </Section>
      ) : null}

      {hasSummary ? (
        <Section title="Summary">
          <p>{summaryText}</p>
        </Section>
      ) : null}

      {hasReasoning ? (
        <Section title="Reasoning">
          <pre className="whitespace-pre-wrap font-sans text-sm text-text-primary">{reasoning}</pre>
        </Section>
      ) : null}

      {hasVerification || hasFinalVerification ? (
        <Section title="Verification">
          {hasVerification ? <p>{verification}</p> : null}
          {hasFinalVerification ? (
            <details className="group">
              <summary className="cursor-pointer text-xs text-text-secondary hover:text-text-primary transition-colors">
                View Verification Payload
              </summary>
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-md border border-dark-border bg-dark-surface/70 p-3 text-xs text-text-secondary">
                {JSON.stringify(finalVerification, null, 2)}
              </pre>
            </details>
          ) : null}
        </Section>
      ) : null}

      {hasFallbacks ? (
        <Section title="Fallback Payload">
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md border border-dark-border bg-dark-surface/70 p-3 text-xs text-text-secondary">
            {JSON.stringify(fallbacks, null, 2)}
          </pre>
        </Section>
      ) : null}

      {hasMetadata ? (
        <Section title="Metadata">
          <div className="divide-y divide-dark-border/70">
            {metadataEntries.map((entry) => (
              <MetadataRow key={entry.label} label={entry.label} value={entry.value} />
            ))}
          </div>
        </Section>
      ) : null}

      {nothingToShow ? (
        <div className="rounded-md border border-dark-border bg-dark-surface/70 px-4 py-3 text-sm text-text-secondary">
          Execution details are not available for this response.
        </div>
      ) : null}
    </div>
  )
}

ExecutionDetailsPanel.propTypes = {
  details: PropTypes.shape({
    planOverview: PropTypes.string,
    plan_overview: PropTypes.string,
    planSummary: PropTypes.string,
    plan: PropTypes.object,
    verification: PropTypes.string,
    executionSteps: PropTypes.arrayOf(executionStepPropType),
    execution_steps: PropTypes.arrayOf(executionStepPropType),
    expectedOutput: PropTypes.string,
    expected_output: PropTypes.string,
    summary: PropTypes.string,
    metadata: PropTypes.object,
    reasoning: PropTypes.string,
    finalVerification: PropTypes.object,
    fallbacks: PropTypes.object,
  }),
}

ExecutionDetailsPanel.defaultProps = {
  details: null,
}

export default ExecutionDetailsPanel


