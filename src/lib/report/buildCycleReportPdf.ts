import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { DailyLog, PeriodFlow, TrackerState } from "@/app/tracker/_types/tracker";
import {
  getCyclePrediction,
  phaseLabels,
} from "@/app/tracker/_lib/cyclePredictions";
import { addDays, toIsoDate } from "@/app/tracker/_lib/dateUtils";
import {
  filterLogsInRange,
  formatPain,
  summarizeLogs,
} from "./cycleReportData";

export type CycleReportPdf = {
  blob: Blob;
  filename: string;
  logCount: number;
  empty: boolean;
  bytes: Uint8Array;
};

const INK: [number, number, number] = [61, 46, 58];
const MUTED: [number, number, number] = [138, 127, 140];
const PRIMARY: [number, number, number] = [255, 111, 94];
const PRIMARY_SOFT: [number, number, number] = [255, 226, 220];
const SECONDARY: [number, number, number] = [79, 179, 217];
const SECONDARY_SOFT: [number, number, number] = [219, 241, 250];
const ACCENT: [number, number, number] = [166, 136, 209];
const CREAM: [number, number, number] = [255, 248, 238];
const MARGIN = 40;
const FOOTER = 36;

const FLOW_COLORS: Record<PeriodFlow, [number, number, number]> = {
  none: [232, 222, 228],
  spotting: [255, 214, 196],
  light: [255, 176, 158],
  medium: [255, 111, 94],
  heavy: [200, 62, 70],
};

const FLOW_ORDER: PeriodFlow[] = ["spotting", "light", "medium", "heavy", "none"];

function tableEndY(doc: jsPDF, fallback: number): number {
  const table = (
    doc as jsPDF & { lastAutoTable?: { finalY: number } }
  ).lastAutoTable;
  return table ? table.finalY + 18 : fallback;
}

function pageInner(doc: jsPDF) {
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  return { width, height, content: width - MARGIN * 2 };
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  const { height } = pageInner(doc);
  if (y + needed <= height - FOOTER) return y;
  doc.addPage();
  return 48;
}

function prettyLabel(value: string) {
  const cleaned = value.replace(/:/g, " · ").replace(/_/g, " ");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function topEntries(counts: Record<string, number>, limit = 6): [string, number][] {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function drawStatCards(
  doc: jsPDF,
  y: number,
  cards: { label: string; value: string }[],
): number {
  const { content } = pageInner(doc);
  const gap = 8;
  const count = cards.length;
  const cardW = (content - gap * (count - 1)) / count;
  const cardH = 54;
  y = ensureSpace(doc, y, cardH + 12);

  cards.forEach((card, index) => {
    const x = MARGIN + index * (cardW + gap);
    doc.setFillColor(...PRIMARY_SOFT);
    doc.roundedRect(x, y, cardW, cardH, 8, 8, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(card.label.toUpperCase(), x + 8, y + 16, { maxWidth: cardW - 16 });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...INK);
    doc.text(card.value, x + 8, y + 38, { maxWidth: cardW - 16 });
  });

  return y + cardH + 16;
}

function drawBarChart(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  title: string,
  rows: [string, number][],
  barColor: [number, number, number],
  emptyLine: string,
): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(title, x, y);
  y += 8;

  if (rows.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(emptyLine, x, y + 12, { maxWidth: width });
    return y + 32;
  }

  const max = Math.max(...rows.map(([, count]) => count), 1);
  const labelW = 78;
  const countW = 16;
  const barMax = Math.max(24, width - labelW - countW);

  for (const [label, count] of rows) {
    y = ensureSpace(doc, y, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...INK);
    doc.text(prettyLabel(label), x, y + 10, { maxWidth: labelW - 4 });
    const barW = Math.max(6, (count / max) * barMax);
    doc.setFillColor(...barColor);
    doc.roundedRect(x + labelW, y, barW, 12, 3, 3, "F");
    doc.setTextColor(...MUTED);
    doc.text(String(count), x + labelW + barW + 4, y + 10);
    y += 16;
  }

  return y + 10;
}

function drawFlowMix(
  doc: jsPDF,
  y: number,
  flow: Record<string, number>,
  logCount: number,
): number {
  const { content } = pageInner(doc);
  y = ensureSpace(doc, y, 72);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text("Flow mix", MARGIN, y);
  y += 10;

  if (logCount === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text("No check-ins to chart.", MARGIN, y + 8);
    return y + 28;
  }

  const barH = 18;
  let x = MARGIN;
  for (const key of FLOW_ORDER) {
    const count = flow[key] ?? 0;
    if (count === 0) continue;
    const slice = (count / logCount) * content;
    doc.setFillColor(...FLOW_COLORS[key]);
    doc.rect(x, y, slice, barH, "F");
    x += slice;
  }
  y += barH + 12;

  let legendX = MARGIN;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  for (const key of FLOW_ORDER) {
    const count = flow[key] ?? 0;
    if (count === 0) continue;
    doc.setFillColor(...FLOW_COLORS[key]);
    doc.roundedRect(legendX, y - 6, 8, 8, 2, 2, "F");
    doc.setTextColor(...INK);
    const caption = `${prettyLabel(key)} ${count}`;
    doc.text(caption, legendX + 11, y);
    legendX += doc.getTextWidth(caption) + 22;
    if (legendX > MARGIN + content - 80) {
      legendX = MARGIN;
      y += 12;
    }
  }

  return y + 18;
}

function drawCheckInCalendar(
  doc: jsPDF,
  y: number,
  logs: DailyLog[],
  fromIso: string,
  toIso: string,
): number {
  const { content } = pageInner(doc);
  const byDate = new Map(logs.map((log) => [log.date, log]));
  const days: string[] = [];
  let cursor = fromIso;
  while (cursor <= toIso && days.length < 120) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  const shown = days.length > 90 ? days.slice(-90) : days;
  const cols = 15;
  const cell = Math.min(14, Math.floor(content / cols) - 1);
  const rows = Math.ceil(shown.length / cols);
  const height = 22 + rows * (cell + 2) + 28;

  y = ensureSpace(doc, y, height);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text("Check-in calendar", MARGIN, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("Colour = period flow that day. Empty square = no log.", MARGIN, y + 10);
  y += 16;

  shown.forEach((date, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = MARGIN + col * (cell + 1);
    const cy = y + row * (cell + 1);
    const log = byDate.get(date);
    if (!log) {
      doc.setDrawColor(232, 222, 228);
      doc.setLineWidth(0.6);
      doc.roundedRect(x, cy, cell, cell, 2, 2, "S");
      return;
    }
    doc.setFillColor(...FLOW_COLORS[log.periodFlow]);
    doc.roundedRect(x, cy, cell, cell, 2, 2, "F");
  });

  y += rows * (cell + 1) + 10;
  let legendX = MARGIN;
  doc.setFontSize(7.5);
  for (const key of FLOW_ORDER) {
    doc.setFillColor(...FLOW_COLORS[key]);
    doc.roundedRect(legendX, y, 8, 8, 2, 2, "F");
    doc.setTextColor(...INK);
    doc.text(prettyLabel(key), legendX + 11, y + 7);
    legendX += 64;
  }
  return y + 20;
}

function drawFooter(doc: jsPDF) {
  const { width, height } = pageInner(doc);
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(
      "Bloom  ·  Local device report  ·  Not medical advice",
      MARGIN,
      height - 24,
    );
    doc.text(`Page ${page} of ${pageCount}`, width - MARGIN, height - 24, {
      align: "right",
    });
  }
}

export function buildCycleReportPdf({
  state,
  fromIso,
  toIso,
  generatedAt = new Date(),
}: {
  state: TrackerState;
  fromIso: string;
  toIso: string;
  generatedAt?: Date;
}): CycleReportPdf {
  const logs = filterLogsInRange(state, fromIso, toIso);
  const empty = logs.length === 0;
  const stats = summarizeLogs(logs);
  const prediction = getCyclePrediction(
    state.cycles,
    state.settings,
    generatedAt,
  );
  const generatedIso = toIsoDate(generatedAt);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const { width, content } = pageInner(doc);
  let y = 48;

  doc.setFillColor(...CREAM);
  doc.rect(0, 0, width, 36, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...INK);
  doc.text("Bloom health report", MARGIN, y);
  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(`Generated ${generatedIso}  ·  Range ${fromIso} to ${toIso}`, MARGIN, y);
  y += 14;
  doc.setFontSize(9);
  doc.text(
    "Prepared from data stored only on this device. Nothing was uploaded to make this file.",
    MARGIN,
    y,
    { maxWidth: content },
  );
  y += 22;

  y = drawStatCards(doc, y, [
    { label: "Check-ins", value: String(stats.logCount) },
    { label: "Period-flow days", value: String(stats.periodDays) },
    { label: "Avg cycle", value: `${prediction.averageCycleLength} d` },
    { label: "Avg period", value: `${prediction.averagePeriodLength} d` },
  ]);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text(
    `Estimated phase today: ${phaseLabels[prediction.estimatedPhase]} (cycle day ${prediction.currentCycleDay})  ·  Next period ${prediction.predictedNextPeriod} (${prediction.daysUntilNextPeriod} days)`,
    MARGIN,
    y,
    { maxWidth: content },
  );
  y += 16;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(
    "This is not a diagnosis. Take it to a trusted adult, GP, or pharmacist to talk through.",
    MARGIN,
    y,
    { maxWidth: content },
  );
  y += 20;

  if (empty) {
    y = ensureSpace(doc, y, 48);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...INK);
    doc.text("No check-ins in this period", MARGIN, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      "There are no daily logs between these dates. Log in Tracker, then generate again.",
      MARGIN,
      y,
      { maxWidth: content },
    );
  } else {
    y = drawFlowMix(doc, y, stats.flow, stats.logCount);

    const colGap = 16;
    const colW = (content - colGap) / 2;
    const chartTop = ensureSpace(doc, y, 80);
    const leftEnd = drawBarChart(
      doc,
      MARGIN,
      chartTop,
      colW,
      "Symptom pattern",
      topEntries(stats.symptoms),
      PRIMARY,
      "No symptoms tagged in this range.",
    );
    const rightEnd = drawBarChart(
      doc,
      MARGIN + colW + colGap,
      chartTop,
      colW,
      "Mood pattern",
      topEntries(stats.moods),
      SECONDARY,
      "No moods tagged in this range.",
    );
    y = Math.max(leftEnd, rightEnd);

    y = drawBarChart(
      doc,
      MARGIN,
      y,
      content,
      "Pain pattern",
      topEntries(stats.pain),
      ACCENT,
      "No pain levels tagged in this range.",
    );

    y = drawCheckInCalendar(doc, y, logs, fromIso, toIso);

    y = ensureSpace(doc, y, 40);
    doc.setFillColor(...SECONDARY_SOFT);
    doc.roundedRect(MARGIN, y, content, 28, 8, 8, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(
      "Detail table below — same check-ins as the diagrams, for a GP or pharmacist to scan.",
      MARGIN + 10,
      y + 18,
      { maxWidth: content - 20 },
    );
    y += 40;

    autoTable(doc, {
      startY: y,
      head: [[
        "Date",
        "Flow",
        "Symptoms",
        "Moods",
        "Pain",
        "Sleep / energy",
        "Meds",
        "Notes",
      ]],
      body: logs.map((log) => [
        log.date,
        log.periodFlow,
        log.symptoms.join(", ") || "—",
        log.moods.join(", ") || "—",
        formatPain(log),
        [log.sleep, log.energy].filter(Boolean).join(" / ") || "—",
        log.medication || "—",
        log.notes || "—",
      ]),
      margin: { left: MARGIN, right: MARGIN },
      styles: { fontSize: 8, cellWidth: "wrap" },
      headStyles: { fillColor: INK },
    });
    tableEndY(doc, y + 40);
  }

  drawFooter(doc);

  const bytes = new Uint8Array(doc.output("arraybuffer"));
  const blob = new Blob([bytes], { type: "application/pdf" });
  return {
    blob,
    filename: `bloom-cycle-report-${toIso}.pdf`,
    logCount: logs.length,
    empty,
    bytes,
  };
}
