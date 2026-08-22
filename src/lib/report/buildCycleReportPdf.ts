import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { TrackerState } from "@/app/tracker/_types/tracker";
import {
  getCyclePrediction,
  phaseLabels,
} from "@/app/tracker/_lib/cyclePredictions";
import { toIsoDate } from "@/app/tracker/_lib/dateUtils";
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

function tableEndY(doc: jsPDF, fallback: number): number {
  const table = (
    doc as jsPDF & { lastAutoTable?: { finalY: number } }
  ).lastAutoTable;
  return table ? table.finalY + 18 : fallback;
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
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 48;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Blossom health report", 40, y);
  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Generated ${generatedIso}  ·  Range ${fromIso} to ${toIso}`, 40, y);
  y += 16;
  doc.setFontSize(9);
  doc.text(
    "Prepared from data stored only on this device. Nothing was uploaded to make this file.",
    40,
    y,
    { maxWidth: pageWidth - 80 },
  );
  y += 28;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Cycle summary", 40, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const summaryLines = [
    `Average cycle length: ${prediction.averageCycleLength} days`,
    `Average period length: ${prediction.averagePeriodLength} days`,
    `Estimated phase today: ${phaseLabels[prediction.estimatedPhase]} (cycle day ${prediction.currentCycleDay})`,
    `Estimated next period: ${prediction.predictedNextPeriod} (${prediction.daysUntilNextPeriod} days)`,
    `Check-ins in this range: ${stats.logCount}  ·  Period-flow days: ${stats.periodDays}`,
  ];
  for (const line of summaryLines) {
    doc.text(line, 40, y);
    y += 14;
  }

  y += 8;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.text(
    "This is not a diagnosis. Take it to a trusted adult, GP, or pharmacist to talk through.",
    40,
    y,
    { maxWidth: pageWidth - 80 },
  );
  y += 22;

  if (empty) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("No check-ins in this period", 40, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      "There are no daily logs between these dates. Log in Tracker, then generate again.",
      40,
      y,
      { maxWidth: pageWidth - 80 },
    );
  } else {
    const symptomRows = Object.entries(stats.symptoms).sort((a, b) => b[1] - a[1]);
    autoTable(doc, {
      startY: y,
      head: [["Symptom", "Times logged"]],
      body: symptomRows.length
        ? symptomRows.map(([key, count]) => [key, String(count)])
        : [["—", "0"]],
      margin: { left: 40, right: 40 },
      styles: { fontSize: 9 },
    });
    y = tableEndY(doc, y + 40);

    const painRows = Object.entries(stats.pain).sort((a, b) => b[1] - a[1]);
    autoTable(doc, {
      startY: y,
      head: [["Pain (symptom:level)", "Times logged"]],
      body: painRows.length
        ? painRows.map(([key, count]) => [key, String(count)])
        : [["—", "0"]],
      margin: { left: 40, right: 40 },
      styles: { fontSize: 9 },
    });
    y = tableEndY(doc, y + 40);

    const moodRows = Object.entries(stats.moods).sort((a, b) => b[1] - a[1]);
    autoTable(doc, {
      startY: y,
      head: [["Mood", "Times logged"]],
      body: moodRows.length
        ? moodRows.map(([key, count]) => [key, String(count)])
        : [["—", "0"]],
      margin: { left: 40, right: 40 },
      styles: { fontSize: 9 },
    });
    y = tableEndY(doc, y + 40);

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
      margin: { left: 40, right: 40 },
      styles: { fontSize: 8, cellWidth: "wrap" },
      headStyles: { fillColor: [61, 46, 58] },
    });
  }

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Blossom  ·  Local device report  ·  Not medical advice",
      40,
      doc.internal.pageSize.getHeight() - 24,
    );
    doc.text(
      `Page ${page} of ${pageCount}`,
      pageWidth - 40,
      doc.internal.pageSize.getHeight() - 24,
      { align: "right" },
    );
  }

  const bytes = new Uint8Array(doc.output("arraybuffer"));
  const blob = new Blob([bytes], { type: "application/pdf" });
  return {
    blob,
    filename: `blossom-cycle-report-${toIso}.pdf`,
    logCount: logs.length,
    empty,
    bytes,
  };
}
