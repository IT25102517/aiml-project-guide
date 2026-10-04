import { models } from './models-data';
import protocol from './data-protocol.json';
export type Result = Record<string, string>;
export function parseCSV(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = [], value = '', quoted = false;
  text = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') { value += '"'; i++; }
      else quoted = !quoted;
    } else if (c === ',' && !quoted) { row.push(value); value = ''; }
    else if ((c === '\n' || c === '\r') && !quoted) {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(value); if (row.some(v => v.trim())) rows.push(row); row = []; value = '';
    } else value += c;
  }
  if (quoted) throw new Error('Unclosed quote in CSV.');
  row.push(value); if (row.some(v => v.trim())) rows.push(row);
  return rows;
}
export function readResult(text: string): Result {
  const rows = parseCSV(text);
  if (rows.length !== 2 || rows[0].length !== rows[1].length) throw new Error('Upload the one-row result CSV, not the variant comparison table or predictions.');
  const r = Object.fromEntries(rows[0].map((h, i) => [h.trim(), rows[1][i]]));
  const model = models.find(m => m.modelId === r.Model_ID);
  if (!model || model.studentId !== r.Student_ID) throw new Error('Model or student ID does not match an assigned member.');
  if (r.Protocol !== protocol.protocol || +r.Tuning_Rows !== protocol.tuningRows || +r.Validation_Rows !== protocol.validationRows || +r.Train_Rows !== 4777 || +r.Holdout_Rows !== 1194 || +r.Features !== 12) throw new Error('These results do not use the shared split and 12-feature protocol.');
  for (const key of ['Validation_RMSE','Validation_MAE','Validation_R2','Train_RMSE','Holdout_RMSE','Holdout_MAE','Holdout_R2']) {
    if (!r[key]?.trim() || !Number.isFinite(+r[key])) throw new Error(`Missing or invalid ${key}.`);
    if (key.endsWith('R2') ? +r[key] > 1 : +r[key] < 0) throw new Error(`Invalid ${key}.`);
  }
  for (const prefix of ['Validation', 'Holdout']) if (+r[`${prefix}_MAE`] > +r[`${prefix}_RMSE`] + 1e-8) throw new Error('MAE cannot exceed RMSE for these results.');
  r.Model = model.modelName;
  return r;
}
export function toCSV(rows: Result[]): string {
  if (!rows.length) return '';
  const keys = Object.keys(rows[0]);
  const quote = (s: string) => '"' + String(s ?? '').replaceAll('"', '""') + '"';
  return [keys, ...rows.map(r => keys.map(k => r[k]))].map(row => row.map(quote).join(',')).join('\r\n');
}
