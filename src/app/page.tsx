import Link from 'next/link';
import { models } from '@/lib/models-data';
import MetricsGuide from '@/components/MetricsGuide';

export default function Home() {
  return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
    <nav className="mb-12 flex flex-wrap items-center justify-between gap-4 text-sm">
      <span className="font-semibold tracking-widest text-blue-300">IT2011 · USED CAR PRICES</span>
      <div className="flex gap-5"><Link className="text-slate-300 hover:text-white" href="/compare">Group comparison</Link><Link className="text-slate-400 hover:text-white" href="/admin">Screenshots</Link></div>
    </nav>
    <header className="max-w-3xl space-y-5">
      <p className="text-sm font-semibold text-emerald-400">ASSIGNMENT 2 · MEMBER GUIDE</p>
      <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Train your model.<br/>Understand your results.</h1>
      <p className="text-lg leading-relaxed text-slate-400">One algorithm per member. Follow six Colab steps, compare your model’s variants, and bring a consistent set of results to the group.</p>
    </header>
    <section className="my-10 rounded-2xl border border-slate-700 bg-slate-900 p-6 sm:p-8" aria-labelledby="setup-title">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div><h2 id="setup-title" className="text-xl font-semibold">Start in Google Colab</h2><p className="mt-2 text-slate-400">Same 12 features. Same split. Same scoring rules.</p></div>
        <a href="/downloads/colab-starter-files.zip" download className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500">Download starter files ↓</a>
      </div>
      <ol className="mt-6 list-inside list-decimal space-y-3 text-slate-300">
        <li>Extract the starter ZIP on your computer.</li>
        <li>Select your name below and download your notebook.</li>
        <li>Open <a className="text-blue-300 underline" href="https://colab.research.google.com" target="_blank" rel="noreferrer">Google Colab</a>, choose File → Upload notebook, and upload that notebook.</li>
        <li>In Colab’s Files panel, upload all five CSVs. Run the cells in order.</li>
      </ol>
      <p className="mt-5 text-sm leading-relaxed text-slate-400">The ZIP contains tuning_train.csv, tuning_validation.csv, processed_train.csv, processed_holdout.csv and processed_university_test.csv. Use the tuning pair to compare four variants, then retrain on the full training file and evaluate on the labelled holdout.</p>
      <details className="mt-4 text-sm text-slate-400"><summary className="cursor-pointer text-blue-300">Where did the tuning files come from?</summary><p className="mt-3">The original training portion was split again before fitting medians or scaling. The two tuning files use development-training statistics only. Your Assignment 1 files and 12 features are retained. A single validation split is easier to follow but less stable than repeated cross-validation.</p><a href="/downloads/shared-validation-preparation.ipynb" download className="mt-3 inline-block text-blue-300 underline">Shared validation preparation notebook</a></details>
    </section>
    <MetricsGuide />
    <section className="mt-12" aria-labelledby="members-title">
      <h2 id="members-title" className="mb-6 text-2xl font-semibold">Choose your guide</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{models.map((m,i) =>
        <Link key={m.modelId} href={`/guide/${m.modelId}`} className="group rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:border-blue-500 focus-visible:outline-2 focus-visible:outline-blue-400">
          <div className="mb-5 flex justify-between text-sm text-slate-500"><span>0{i+1}</span><span>6 steps + viva →</span></div>
          <h3 className="text-xl font-semibold group-hover:text-blue-300">{m.modelName}</h3>
          <p className="mt-3 text-slate-300">{m.memberName}</p><p className="mt-1 text-sm text-slate-500">{m.studentId}</p>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">{m.modelDescription}</p>
        </Link>)}</div>
    </section>
    <section className="mt-10 border-t border-slate-800 pt-8 text-sm leading-relaxed text-slate-400">
      <h2 className="mb-2 text-lg font-semibold text-slate-200">When everyone finishes</h2>
      <p>Collect each member’s result CSV, four-variant comparison table and notebook. Use the <Link href="/compare" className="text-blue-300 underline">group comparison</Link> to rank the chosen variants. Keep the university test predictions separate: that file has no Price labels.</p>
    </section>
  </main>;
}
