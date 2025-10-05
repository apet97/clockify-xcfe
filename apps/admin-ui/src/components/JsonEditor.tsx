import React from 'react';

type JsonEditorProps = {
  value: string;
  onChange: (next: string) => void;
  minRows?: number;
};

const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange, minRows = 8 }) => (
  <textarea
    value={value}
    onChange={event => onChange(event.target.value)}
    rows={minRows}
    spellCheck={false}
    style={{ fontFamily: 'monospace' }}
  />
);

export default JsonEditor;
