import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ActivatedRoute, Router } from '@angular/router';
import { Settings } from '../models/settings';
import { DirectoryDashboardService } from '../../dashboard/directory-dashboard/directory-dashboard.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { ExportToJustifiTemplateService } from './export-to-justifi-services/export-to-justifi-template.service';
import { ExportToJustifiModalComponent } from './export-to-justifi-modal.component';
import { buildRebuiltAssessment } from '../../process-heating-assessment/services/rebuilt-assessment.fixture';

describe('ExportToJustifiModalComponent', () => {
  let component: ExportToJustifiModalComponent;

  beforeEach(() => {
    const settingsDbService = jasmine.createSpyObj<SettingsDbService>('SettingsDbService', ['getByAssessmentId']);
    settingsDbService.getByAssessmentId.and.returnValue({ energySourceType: 'Fuel' } as Settings);
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot()],
      declarations: [ExportToJustifiModalComponent],
      providers: [
        { provide: SettingsDbService, useValue: settingsDbService },
        { provide: DirectoryDashboardService, useValue: {} },
        { provide: ExportToJustifiTemplateService, useValue: {} },
        { provide: DirectoryDbService, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: Router, useValue: {} },
        { provide: AssessmentDbService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    component = TestBed.createComponent(ExportToJustifiModalComponent).componentInstance;
  });

  describe('addAssessment', () => {
    it('exports a PHAST assessment in the legacy shape, without Auxiliary Power, leaving the saved one unchanged', () => {
      const assessment = buildRebuiltAssessment();

      component.addAssessment(assessment);

      const exported = component.selectedAssessments[0];
      expect(exported.phast.losses.auxiliaryPowerLosses).toBeUndefined();
      expect(exported.phast.modifications[0].phast.name).toBe('Mod 1');
      expect(exported.phast.selectedModificationId).toBe('m1');
      expect(assessment.phast.selectedModificationId).toBeUndefined();
      expect(assessment.phast.modifications[0].phast).toBeUndefined();
    });
  });
});
