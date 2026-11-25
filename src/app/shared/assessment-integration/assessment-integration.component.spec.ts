import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { FeatureFlagService } from '../feature-flag.service';
import { TreasureHuntService } from '../../treasure-hunt/treasure-hunt.service';
import { AssessmentIntegrationService, AssessmentEnergyOption, ExistingIntegrationData, IntegratedAssessment } from './assessment-integration.service';
import { AssessmentIntegrationComponent } from './assessment-integration.component';

function buildOption(modificationId: string, annualCost: number): AssessmentEnergyOption {
  return { name: `Mod ${modificationId}`, modificationId, annualEnergy: 10, co2EmissionsOutput: 1, annualCost };
}

describe('AssessmentIntegrationComponent', () => {
  let component: AssessmentIntegrationComponent;
  let integrationService: jasmine.SpyObj<AssessmentIntegrationService>;

  beforeEach(() => {
    integrationService = jasmine.createSpyObj<AssessmentIntegrationService>('AssessmentIntegrationService', ['setIntegratedAssessment', 'checkHasUpdatedEnergyData']);
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot()],
      declarations: [AssessmentIntegrationComponent],
      providers: [
        { provide: FeatureFlagService, useValue: { showOperationalImpacts: signal(false) } },
        { provide: AssessmentIntegrationService, useValue: integrationService },
        { provide: TreasureHuntService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    component = TestBed.createComponent(AssessmentIntegrationComponent).componentInstance;
    // ngOnInit loads assessments and needs the report modal, so give the update its form and ngOnDestroy its subscription directly.
    component.assessmentIntegrationForm = new FormGroup({ selectedModificationId: new FormControl<string>('m1') });
    component.reportSub = new Subscription();
  });

  describe('setExistingIntegratedAssessment', () => {
    it('skips the stale-data check for a linked assessment with no energy options', async () => {
      component.assessmentIntegrationForm.addControl('assessmentType', new FormControl<string>(undefined));
      component.existingIntegrationData = {
        assessmentId: 1, assessmentType: 'PHAST', assessmentName: 'Furnace', selectedModificationId: 'm1',
        energyOptions: { baseline: buildOption(undefined, 100), modifications: [buildOption('m1', 80)] },
      };
      integrationService.setIntegratedAssessment.and.resolveTo({ assessment: {}, assessmentType: 'PHAST' } as IntegratedAssessment);

      await component.setExistingIntegratedAssessment();

      expect(integrationService.checkHasUpdatedEnergyData).not.toHaveBeenCalled();
      expect(component.hasUpdatedEnergyData).toBeFalsy();
    });
  });

  describe('updateExistingIntegrationData', () => {
    it('links the first remaining modification when the linked one no longer exists', async () => {
      const existing: ExistingIntegrationData = {
        assessmentId: 1, assessmentType: 'PHAST', assessmentName: 'Furnace', selectedModificationId: 'm1',
        energyOptions: { baseline: buildOption(undefined, 100), modifications: [buildOption('m1', 80)] },
      };
      component.existingIntegrationData = existing;
      component.integratedAssessment = {
        hasModifications: true, selectedModificationId: 'm1',
        energyOptions: { baseline: buildOption(undefined, 100), modifications: [buildOption('m2', 70), buildOption('m3', 60)] },
      } as IntegratedAssessment;
      const emitted = spyOn(component.integratedAssessmentSelected, 'emit');

      await component.updateExistingIntegrationData();

      expect(existing.selectedModificationId).toBe('m2');
      expect(existing.energyOptions.modifications).toEqual([buildOption('m2', 70)]);
      expect(component.assessmentIntegrationForm.controls.selectedModificationId.value).toBe('m2');
      expect(emitted).toHaveBeenCalledWith(jasmine.objectContaining({ selectedModificationId: 'm2' }));
    });
  });
});
