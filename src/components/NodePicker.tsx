"use client";

interface NodePickerProps {
  nodeNames: string[];
  value: string;
  onChange: (nodeName: string) => void;
  onAdd: () => void;
}

export function NodePicker({ nodeNames, value, onChange, onAdd }: NodePickerProps) {
  return (
    <div className="flex items-center gap-2">
      <select
        className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {nodeNames.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onAdd}
        className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
      >
        Add
      </button>
    </div>
  );
}
