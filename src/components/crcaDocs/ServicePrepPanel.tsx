import { RotateCcw, Sparkles } from 'lucide-react';
import type { FormSchema } from '../../lib/crcaDocs/types';

interface ServicePrepPanelProps {
  schema: FormSchema;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onReset: () => void;
}

export function ServicePrepPanel({
  schema,
  values,
  onChange,
  onReset,
}: ServicePrepPanelProps) {
  const hasAnyValue = Object.values(values).some((v) => v.trim().length > 0 && v !== 'original');

  return (
    <div id="service-prep-panel" className="no-print border-b border-stone-200 bg-teal-50/50 px-5 py-4 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-teal-600" />
          <h2 className="font-sans text-xs font-bold uppercase tracking-wider text-navy-900">
            Service Prep — Personalise Names &amp; Pronouns
          </h2>
        </div>

        {hasAnyValue && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-xs font-semibold text-navy-800 hover:border-teal-500 hover:text-teal-700"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {schema.fields.length > 0 && (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {schema.fields.map((field) =>
            field.type === 'pronoun' && field.options ? (
              <div key={field.key} className="sm:col-span-2 lg:col-span-3">
                <div className="mb-1.5 text-xs font-semibold text-navy-900">
                  {field.label}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {field.options.map((opt) => {
                    const active = (values[field.key] || 'original') === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(field.key, opt.value)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          active
                            ? 'border-navy-900 bg-navy-900 text-white'
                            : 'border-stone-300 bg-white text-navy-800 hover:border-teal-500 hover:text-teal-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div key={field.key}>
                <label
                  htmlFor={`prep-${field.key}`}
                  className="mb-1 block text-xs font-semibold text-navy-900"
                >
                  {field.label}
                </label>
                <input
                  id={`prep-${field.key}`}
                  type="text"
                  value={values[field.key] ?? ''}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-navy-900 placeholder:text-stone-600/70 focus:border-teal-500 focus:outline-none"
                />
              </div>
            )
          )}
        </div>
      )}

      {schema.hasChoiceTables && (
        <p className="mt-3 text-xs text-stone-700">
          Tip: Where this form shows <strong>EITHER / OR</strong> options side-by-side, click{' '}
          <strong>Use this option</strong> in the table header below to select your choice for
          copying and printing.
        </p>
      )}
    </div>
  );
}
