const safeCell = (value: unknown) => {
  let text = String(value ?? "").replace(/\r?\n/g, " ");
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};
export const csvText = (rows: unknown[][]) => `\uFEFF${rows.map(row => row.map(safeCell).join(",")).join("\r\n")}`;
export function downloadCsv(filename: string, rows: unknown[][]) {
  const blob = new Blob([csvText(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob), link = document.createElement("a");
  link.href = url; link.download = filename; link.hidden = true; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
