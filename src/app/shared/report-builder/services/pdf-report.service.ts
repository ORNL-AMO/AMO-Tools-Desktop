import { Injectable } from '@angular/core';
import { BaseReportService } from './base-report.service';
import { ReportDocument } from '../models/report-document.model';
import {
  ChartSection,
  KeyValueSection,
  ReportSection,
  SummaryTableSection,
  TextSection,
} from '../models/report-section.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DEFAULT_ACCENT_COLOR: [number, number, number] = [30, 90, 140];

/** A4 landscape dimensions in mm */
const PAGE_WIDTH_MM = 297;
const PAGE_HEIGHT_MM = 210;

const PAGE_MARGIN_MM = 15;
const CONTENT_WIDTH_MM = PAGE_WIDTH_MM - PAGE_MARGIN_MM * 2;

/** Vertical gap added after each rendered section */
const SECTION_GAP_MM = 8;

const SECTION_HEADING_FONT_SIZE = 11;
const BODY_FONT_SIZE = 9;

@Injectable({ providedIn: 'root' })
export class PdfReportService extends BaseReportService {
  private moduleColor: [number, number, number] = DEFAULT_ACCENT_COLOR;

  /**
   * Generates a landscape A4 PDF from the given ReportDocument and triggers a browser download.
   * Renders a cover page first, then iterates over each section in order.
   */
  async export(document: ReportDocument, filename: string): Promise<void> {
    this.moduleColor = document.meta.moduleColor ?? DEFAULT_ACCENT_COLOR;

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    let cursorY = this.renderCover(pdf, document);

    const sections = [...document.sections];

    // * When the user exports a selection, the first included section may already have that flag set — strip it so we don't open with a blank page.
    if (sections.length > 0 && sections[0].pageBreakBefore) {
      sections[0] = { ...sections[0], pageBreakBefore: false };
    }

    for (const section of sections) {
      cursorY = await this.renderSection(pdf, section, cursorY);
    }

    pdf.save(filename);
  }

  /**
   * Renders the document cover: title, optional subtitle, generated date, and a dividing rule.
   * Returns the Y position after the cover block.
   */
  private renderCover(pdf: jsPDF, document: ReportDocument): number {
    const { meta } = document;
    let cursorY = PAGE_MARGIN_MM + 10;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.setTextColor(...this.moduleColor);
    pdf.text(meta.title, PAGE_MARGIN_MM, cursorY);
    cursorY += 8;

    if (meta.subtitle) {
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      pdf.text(meta.subtitle, PAGE_MARGIN_MM, cursorY);
      cursorY += 6;
    }

    pdf.setFontSize(BODY_FONT_SIZE);
    pdf.setTextColor(100, 100, 100);
    const formattedDate = meta.date
      ? new Date(meta.date).toLocaleDateString('en-US', { dateStyle: 'long' })
      : '';
    pdf.text(`Generated: ${formattedDate}`, PAGE_MARGIN_MM, cursorY);
    if (meta.units) {
      pdf.text(`Units: ${meta.units}`, PAGE_MARGIN_MM + 60, cursorY);
    }
    cursorY += 6;

    pdf.setDrawColor(...this.moduleColor);
    pdf.setLineWidth(0.5);
    pdf.line(PAGE_MARGIN_MM, cursorY, PAGE_WIDTH_MM - PAGE_MARGIN_MM, cursorY);
    cursorY += SECTION_GAP_MM;

    return cursorY;
  }

  /**
   * Dispatches a single section to its type-specific renderer.
   * Adds a new page when the section requests one or when remaining vertical space is low.
   * Returns the updated Y cursor position.
   */
  private async renderSection(pdf: jsPDF, section: ReportSection, cursorY: number): Promise<number> {
    const nearBottomThreshold = PAGE_HEIGHT_MM - 40;
    if (section.pageBreakBefore || cursorY > nearBottomThreshold) {
      pdf.addPage();
      cursorY = PAGE_MARGIN_MM;
    }

    switch (section.type) {
      case 'text':
        return this.renderText(pdf, section as TextSection, cursorY);
      case 'key-value-list':
        return this.renderKeyValue(pdf, section as KeyValueSection, cursorY);
      case 'summary-table':
        return this.renderTable(pdf, section as SummaryTableSection, cursorY);
      case 'chart':
        return this.renderChart(pdf, section as ChartSection, cursorY);
      default:
        return cursorY;
    }
  }

  /**
   * Renders a plain paragraph of text, word-wrapped to the content width.
   * Returns the Y position after the text block.
   */
  private renderText(pdf: jsPDF, section: TextSection, cursorY: number): number {
    const LINE_HEIGHT_MM = 4.5;
    const BOTTOM_MARGIN_MM = PAGE_HEIGHT_MM - PAGE_MARGIN_MM;

    cursorY = this.renderSectionTitle(pdf, section.title, cursorY);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(BODY_FONT_SIZE);
    pdf.setTextColor(40, 40, 40);

    const wrappedLines: string[] = pdf.splitTextToSize(section.content, CONTENT_WIDTH_MM);
    for (const line of wrappedLines) {
      if (cursorY + LINE_HEIGHT_MM > BOTTOM_MARGIN_MM) {
        pdf.addPage();
        cursorY = PAGE_MARGIN_MM;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(BODY_FONT_SIZE);
        pdf.setTextColor(40, 40, 40);
      }
      pdf.text(line, PAGE_MARGIN_MM, cursorY);
      cursorY += LINE_HEIGHT_MM;
    }

    return cursorY + SECTION_GAP_MM;
  }

  /**
   * Renders a two-column property/value table using jspdf-autotable.
   * Returns the Y position after the table.
   */
  private renderKeyValue(pdf: jsPDF, section: KeyValueSection, cursorY: number): number {
    cursorY = this.renderSectionTitle(pdf, section.title, cursorY);
    autoTable(pdf, {
      head: [['Property', 'Value', 'Unit']],
      body: section.rows.map(row => [row.label, row.value, row.unit ?? '']),
      startY: cursorY,
      margin: { left: PAGE_MARGIN_MM, right: PAGE_MARGIN_MM },
      theme: 'striped',
      headStyles: { fillColor: this.moduleColor, fontSize: BODY_FONT_SIZE, fontStyle: 'bold' },
      styles: { fontSize: BODY_FONT_SIZE, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 80 }, 2: { cellWidth: 30 } },
    });
    return (pdf as any).lastAutoTable.finalY + SECTION_GAP_MM;
  }

  /**
   * Renders a multi-column summary table using jspdf-autotable.
   * Emphasis rows (totals, savings) are bold with a tinted background derived from the accent color.
   * The first column (metric labels) is left-aligned; all other columns are centered.
   * Returns the Y position after the table.
   */
  private renderTable(pdf: jsPDF, section: SummaryTableSection, cursorY: number): number {
    cursorY = this.renderSectionTitle(pdf, section.title, cursorY);

    const emphasisRowsIndiceset = new Set(section.emphasisRowsIndices ?? []);
    const subGroupHeaderIndiceset = new Set(section.subGroupHeaderIndices ?? []);
    const [accentRed, accentGreen, accentBlue] = this.moduleColor;

    const emphasisFillColor: [number, number, number] = [
      Math.min(255, accentRed + 200),
      Math.min(255, accentGreen + 150),
      Math.min(255, accentBlue + 110),
    ];
    const groupHeaderFillColor: [number, number, number] = [
      Math.round(accentRed * 0.6 + 255 * 0.4),
      Math.round(accentGreen * 0.6 + 255 * 0.4),
      Math.round(accentBlue * 0.6 + 255 * 0.4),
    ];

    autoTable(pdf, {
      head: [section.headers],
      body: section.rows,
      startY: cursorY,
      margin: { left: PAGE_MARGIN_MM, right: PAGE_MARGIN_MM },
      theme: 'striped',
      headStyles: {
        fillColor: this.moduleColor,
        fontSize: BODY_FONT_SIZE,
        fontStyle: 'bold',
        halign: 'center',
      },
      styles: { fontSize: BODY_FONT_SIZE, cellPadding: 2, overflow: 'linebreak', halign: 'center' },
      columnStyles: { 0: { halign: 'left' } },
      rowPageBreak: 'avoid',
      didParseCell: (data) => {
        if (data.section !== 'body') return;
        if (subGroupHeaderIndiceset.has(data.row.index)) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = groupHeaderFillColor;
          data.cell.styles.textColor = [255, 255, 255];
        } else if (emphasisRowsIndiceset.has(data.row.index)) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = emphasisFillColor;
        }
      },
    });
    return (pdf as any).lastAutoTable.finalY + SECTION_GAP_MM;
  }

  /**
   * Renders a chart section using the provided imageDataProvider.
   * Adds a new page when the image height exceeds the remaining space on the current page.
   * Falls back to rendering altData as a table when image generation fails.
   * Returns the Y position after the image or fallback table.
   */
  private async renderChart(pdf: jsPDF, section: ChartSection, cursorY: number): Promise<number> {
    let imageData: string | null = null;
    let imageAspectRatio: number = 2;

    if (section.imageDataProvider) {
      try {
        imageData = await section.imageDataProvider();
        // Plotly.toImage returns a data URL; derive aspect from a known fixed ratio (1400×700)
        imageAspectRatio = 2; // width / height
      } catch {
        // fall through to altData
        // todo display section with a message "Chart image failed to generate" and a warning icon
      }
    }

    if (imageData) {
      const imageHeightMM = CONTENT_WIDTH_MM / imageAspectRatio;
      const remainingPageHeightMM = PAGE_HEIGHT_MM - PAGE_MARGIN_MM - cursorY;

      if (imageHeightMM > remainingPageHeightMM) {
        pdf.addPage();
        cursorY = PAGE_MARGIN_MM;
      }
      cursorY = this.renderSectionTitle(pdf, section.title, cursorY);
      pdf.addImage(imageData, 'PNG', PAGE_MARGIN_MM, cursorY, CONTENT_WIDTH_MM, imageHeightMM);
      return cursorY + imageHeightMM + SECTION_GAP_MM;
    }

    cursorY = this.renderSectionTitle(pdf, section.title, cursorY);
    if (section.altData) {
      return this.renderTable(pdf, section.altData, cursorY);
    }

    return cursorY;
  }

  /**
   * Renders an optional section heading in the accent color above the section content.
   * Returns the unchanged Y position when no title is provided.
   */
  private renderSectionTitle(pdf: jsPDF, title: string | undefined, cursorY: number): number {
    if (!title) return cursorY;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(SECTION_HEADING_FONT_SIZE);
    pdf.setTextColor(...this.moduleColor);
    pdf.text(title, PAGE_MARGIN_MM, cursorY);
    return cursorY + 6;
  }
}
