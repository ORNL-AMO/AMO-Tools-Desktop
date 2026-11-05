import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { ExportToJustifiTemplateService } from '../export-to-justifi-modal/export-to-justifi-services/export-to-justifi-template.service';
import { Assessment } from '../models/assessment';
import { ExportToJustifiDialogComponent } from './export-to-justifi-dialog.component';

describe('ExportToJustifiDialogComponent', () => {
  let fixture: ComponentFixture<ExportToJustifiDialogComponent>;
  let exportService: jasmine.SpyObj<ExportToJustifiTemplateService>;

  const text = (): string => fixture.nativeElement.textContent;
  const exportButton = (): HTMLButtonElement | undefined =>
    [...fixture.nativeElement.querySelectorAll('button')].find((button: HTMLButtonElement) => button.textContent.trim() === 'Export');

  beforeEach(() => {
    exportService = jasmine.createSpyObj<ExportToJustifiTemplateService>('ExportToJustifiTemplateService', ['exportData']);
    const assessment = { id: 1, name: 'Furnace', type: 'PHAST', phast: { modifications: [] } } as unknown as Assessment;
    TestBed.configureTestingModule({
      providers: [
        { provide: DialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: DIALOG_DATA, useValue: { assessment } },
        { provide: ExportToJustifiTemplateService, useValue: exportService },
        { provide: SettingsDbService, useValue: { getByAssessmentId: () => ({}) } },
      ],
    });
    fixture = TestBed.createComponent(ExportToJustifiDialogComponent);
    fixture.detectChanges();
  });

  it('shows success and removes Export only after the export resolves', async () => {
    let resolveExport: () => void;
    exportService.exportData.and.returnValue(new Promise<void>(resolve => { resolveExport = resolve; }));

    exportButton().click();
    fixture.detectChanges();
    expect(text()).not.toContain('Export completed successfully');
    expect(exportButton()).toBeDefined();

    resolveExport();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(text()).toContain('Export completed successfully');
    expect(exportButton()).toBeUndefined();
  });

  it('shows an error and keeps Export available when the export fails', async () => {
    exportService.exportData.and.rejectWith(new Error('template missing'));

    exportButton().click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(text()).toContain('The export failed');
    expect(text()).not.toContain('Export completed successfully');
    expect(exportButton()).toBeDefined();
  });
});
