import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssessmentItemComponent } from './assessment-item.component';
import { AssessmentService } from '../../assessment.service';
import { ModalDialogService } from '../../../shared/modal-dialog.service';
import { OpenProcessHeatingModuleModalComponent, OpenProcessHeatingModuleModalData } from '../../../shared/open-process-heating-module-modal/open-process-heating-module-modal.component';
import { Assessment } from '../../../shared/models/assessment';
import { Modification } from '../../../shared/models/phast/phast';
import { buildRebuiltAssessment } from '../../../process-heating-assessment/services/rebuilt-assessment.fixture';

function buildLegacyAssessment(): Assessment {
  const assessment = buildRebuiltAssessment();
  assessment.phast.modifications = [{ id: 'm1', phast: { name: 'Mod 1' } }] as unknown as Modification[];
  return assessment;
}

describe('AssessmentItemComponent', () => {
  let component: AssessmentItemComponent;
  let fixture: ComponentFixture<AssessmentItemComponent>;
  let assessmentService: jasmine.SpyObj<AssessmentService>;
  let modalDialogService: jasmine.SpyObj<ModalDialogService>;

  beforeEach(() => {
    assessmentService = jasmine.createSpyObj('AssessmentService', ['goToAssessment']);
    modalDialogService = jasmine.createSpyObj('ModalDialogService', ['openModal']);

    TestBed.configureTestingModule({
      declarations: [AssessmentItemComponent],
      providers: [
        { provide: AssessmentService, useValue: assessmentService },
        { provide: ModalDialogService, useValue: modalDialogService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(AssessmentItemComponent);
    component = fixture.componentInstance;
  });

  describe('goToAssessment', () => {
    it('opens the rebuild directly when the legacy module cannot open the assessment', () => {
      const assessment = buildRebuiltAssessment();

      component.goToAssessment(assessment);

      expect(modalDialogService.openModal).not.toHaveBeenCalled();
      expect(assessmentService.goToAssessment).toHaveBeenCalledWith(assessment);
    });

    it('asks which module to open when the legacy module can open the assessment', () => {
      component.goToAssessment(buildLegacyAssessment());

      expect(modalDialogService.openModal).toHaveBeenCalledWith(OpenProcessHeatingModuleModalComponent, jasmine.any(Object));
      expect(assessmentService.goToAssessment).not.toHaveBeenCalled();
    });

    it('opens the module the user picks', () => {
      const assessment = buildLegacyAssessment();
      component.goToAssessment(assessment);
      const { onSelect } = modalDialogService.openModal.calls.mostRecent().args[1].data as OpenProcessHeatingModuleModalData;

      onSelect('phast');

      expect(assessmentService.goToAssessment).toHaveBeenCalledWith(assessment, undefined, undefined, 'phast');
    });
  });
});
