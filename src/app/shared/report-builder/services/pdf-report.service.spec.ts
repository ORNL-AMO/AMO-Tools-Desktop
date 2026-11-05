import { TestBed } from '@angular/core/testing';
import jsPDF from 'jspdf';
import { AlertSection } from '../models/report-section.model';
import { PdfReportService } from './pdf-report.service';

const PAGE_HEIGHT_MM = 210;
const PAGE_MARGIN_MM = 15;

describe('PdfReportService alert', () => {
  let service: PdfReportService;
  let pdf: jsPDF;
  let textYs: number[];

  const render = (lineCount: number, startY = PAGE_MARGIN_MM): number => {
    const section: AlertSection = {
      type: 'alert',
      title: 'Invalid Modifications (Omitted)',
      lines: Array.from({ length: lineCount }, (_, index) => `Scenario ${index + 1}: Errors found in Wall`),
      group: 'report',
    };
    return service['renderAlert'](pdf, section, startY);
  };

  beforeEach(() => {
    service = TestBed.inject(PdfReportService);
    pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    textYs = [];
    const text = pdf.text.bind(pdf);
    spyOn(pdf, 'text').and.callFake(((...args: Parameters<jsPDF['text']>) => {
      textYs.push(args[2] as number);
      return text(...args);
    }) as jsPDF['text']);
  });

  it('keeps a short alert on one page', () => {
    render(5);
    expect(pdf.getNumberOfPages()).toBe(1);
  });

  it('moves a short alert that does not fit the rest of the page to a new page', () => {
    render(5, 170);
    expect(pdf.getNumberOfPages()).toBe(2);
  });

  it('continues an alert taller than a page onto following pages without text below the bottom margin', () => {
    render(80);
    expect(pdf.getNumberOfPages()).toBeGreaterThan(1);
    expect(Math.max(...textYs)).toBeLessThanOrEqual(PAGE_HEIGHT_MM - PAGE_MARGIN_MM);
  });

  it('repeats the title on every page the alert spans', () => {
    render(80);
    const titles = (pdf.text as jasmine.Spy).calls.allArgs().filter(args => String(args[0]).startsWith('Invalid Modifications'));
    expect(titles.length).toBe(pdf.getNumberOfPages());
  });
});
