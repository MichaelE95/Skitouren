import React from 'react';

/**
 * "Lawinenexposition" 1–5, modelled on ATES v2 (Avalanche Terrain Exposure Scale, 2023):
 * stored value = ATES class + 1. Static terrain property – independent of the daily bulletin.
 */
export const EXPOSURE_LEVELS: { value: number; label: string; ates: string; description: string }[] = [
  { value: 1, label: 'Kaum Lawinengelände', ates: 'ATES 0', description: 'Flach oder dichter Wald, keine Lawinenbahnen.' },
  { value: 2, label: 'Einfach', ates: 'ATES 1', description: 'Überwiegend flach/bewaldet, kurze Steilstufen, viele Ausweichmöglichkeiten.' },
  { value: 3, label: 'Anspruchsvoll', ates: 'ATES 2', description: 'Klare Lawinenbahnen, Geländefallen oder Steilhänge; meidbar durch gute Spurwahl.' },
  { value: 4, label: 'Komplex', ates: 'ATES 3', description: 'Mehrere Lawinenbahnen, große Anrissgebiete, kaum Ausweichmöglichkeiten.' },
  { value: 5, label: 'Extrem', ates: 'ATES 4', description: 'Sehr steil, ausgesetzt, ständige Lawinenexposition.' }
];

const DOT_COLORS = ['bg-emerald-500', 'bg-lime-500', 'bg-amber-500', 'bg-orange-600', 'bg-rose-700'];

export function exposureLabel(value: number | null | undefined): string {
  const l = EXPOSURE_LEVELS.find(e => e.value === value);
  return l ? `${l.value}/5 ${l.label} (${l.ates})` : 'Noch nicht bewertet';
}

/** Small read-only badge for cards. */
export const ExposureBadge: React.FC<{ value: number | null | undefined }> = ({ value }) => {
  if (!value) {
    return (
      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300" title="Lawinenexposition noch nicht bewertet">
        Lawine ?
      </span>
    );
  }
  return (
    <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-slate-700" title={`Lawinenexposition: ${exposureLabel(value)}`}>
      <span>Lawine</span>
      <Dots value={value} size="w-1.5 h-1.5" />
    </span>
  );
};

const Dots: React.FC<{ value: number; size: string }> = ({ value, size }) => (
  <span className="inline-flex space-x-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} className={`${size} rounded-full ${i <= value ? DOT_COLORS[value - 1] : 'bg-slate-200'}`} />
    ))}
  </span>
);

/** Editable 1–5 picker (click the same value again to clear). */
export const ExposurePicker: React.FC<{
  value: number | null | undefined;
  onChange: (v: number | null) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
  const current = EXPOSURE_LEVELS.find(e => e.value === value);
  return (
    <div>
      <div className="flex items-center space-x-1">
        {EXPOSURE_LEVELS.map(l => (
          <button
            key={l.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(value === l.value ? null : l.value)}
            title={`${l.value} – ${l.label} (${l.ates}): ${l.description}`}
            className={`w-8 h-7 rounded-lg text-xs font-bold border transition-colors ${
              value && l.value <= value
                ? `${DOT_COLORS[value - 1]} text-white border-transparent`
                : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400'
            }`}
          >
            {l.value}
          </button>
        ))}
      </div>
      <div className="mt-1 text-[10px] text-slate-500">
        {current ? `${current.label} (${current.ates}): ${current.description}` : 'Noch nicht bewertet – Tour bleibt bei jedem Filter sichtbar.'}
      </div>
    </div>
  );
};

