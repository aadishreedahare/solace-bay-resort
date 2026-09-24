import type { InputHTMLAttributes } from 'react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  label: string;
  onChange: (value: string) => void;
  rows?: number; // pass rows to render a textarea
};

export function TextField({ label, onChange, rows, ...props }: Props) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {rows ? (
        <textarea
          rows={rows}
          value={props.value}
          required={props.required}
          onChange={(e) => onChange(e.target.value)}
          className="input"
        />
      ) : (
        <input {...props} onChange={(e) => onChange(e.target.value)} className="input" />
      )}
    </label>
  );
}
