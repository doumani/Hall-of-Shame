import type { Metadata } from "next"
import { SubmitForm } from "@/components/submit-form"

export const metadata: Metadata = {
  title: "Suggest an entry",
  description:
    "Suggest an entry, a correction, or a public-domain image. This form is a placeholder and does not send data.",
}

export default function SubmitPage() {
  return (
    <div>
      <header className="bg-navy text-cream">
        <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
          <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.22em] text-cream/75 uppercase">
            <span className="h-px w-8 bg-cardinal" />
            Suggestions
          </p>
          <h1 className="display mt-4 max-w-3xl text-5xl leading-[0.95] text-cream md:text-7xl">
            Suggest an entry.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-cream/80 md:text-lg">
            This is the place to suggest an entry, a correction, or a
            public-domain image. The form is a placeholder. It does not send
            or save anything yet.
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <SubmitForm />
      </div>
    </div>
  )
}
