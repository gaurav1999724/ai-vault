import { Markdown } from "@/components/content/markdown";
import type { WorkflowStep } from "@/types/content";

export function TutorialTimeline({ steps }: { steps: WorkflowStep[] }) {
  if (!steps.length) return null;
  return (
    <ol className="space-y-8">
      {steps.map((step) => (
        <li key={step.order} id={`step-${step.order}`} className="grid gap-4 border-t border-line pt-6 md:grid-cols-[4rem_1fr]">
          <span className="font-display text-3xl text-violet">{String(step.order).padStart(2, "0")}</span>
          <div>
            <h3 className="font-display text-3xl">{step.title}</h3>
            <div className="mt-3">
              <Markdown content={step.body} />
            </div>
            {step.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={step.imageUrl} alt={step.imageAlt || ""} className="mt-4 max-h-80 rounded-2xl object-cover" />
            ) : null}
            {step.tip ? <p className="mt-4 rounded-2xl bg-cyan/10 px-4 py-3 text-sm">Tip: {step.tip}</p> : null}
            {step.warning ? <p className="mt-3 rounded-2xl bg-warm/10 px-4 py-3 text-sm text-warm">Warning: {step.warning}</p> : null}
            {step.externalLink ? (
              <a className="mt-3 inline-block text-sm text-cyan" href={step.externalLink} target="_blank" rel="noreferrer">
                Open reference
              </a>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
