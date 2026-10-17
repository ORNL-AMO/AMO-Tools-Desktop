import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogRef } from '@angular/cdk/dialog';
import { of, Subject } from 'rxjs';
import { ModalDialogService } from '../../../shared/modal-dialog.service';
import { OperatingHours } from '../../../shared/models/operations';
import { OperatingHoursComponent } from '../../../shared/operating-hours/operating-hours.component';
import { PHAST } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { FakeProcessHeatingAssessmentService, FakeProcessHeatingUiService } from '../opportunity-test-fakes';
import { OperationsOpportunityComponent } from './operations-opportunity.component';

const BASELINE: PHAST = {
  name: 'Baseline',
  losses: {},
  operatingHours: { weeksPerYear: 52, daysPerWeek: 7, hoursPerDay: 24, hoursPerYear: 8736 },
  operatingCosts: { fuelCost: 3.5, steamCost: 10, electricityCost: 0.066 },
  modifications: [],
};

const MODAL_HOURS: OperatingHours = { weeksPerYear: 50, daysPerWeek: 5, hoursPerDay: 16, hoursPerYear: 4000 };

describe('OperationsOpportunityComponent', () => {
  let fixture: ComponentFixture<OperationsOpportunityComponent>;
  let component: OperationsOpportunityComponent;
  let modificationService: ModificationService;
  let assessmentService: FakeProcessHeatingAssessmentService;
  let modalDialogService: jasmine.SpyObj<ModalDialogService>;

  function effective(): PHAST {
    return assessmentService.scenarioPhast(modificationService.selectedModificationId());
  }

  function sectionState(section: string) {
    return component.sections().find(candidate => candidate.section === section);
  }

  beforeEach(() => {
    modalDialogService = jasmine.createSpyObj<ModalDialogService>('ModalDialogService', ['openModal']);
    TestBed.configureTestingModule({
      declarations: [OperationsOpportunityComponent],
      providers: [
        ModificationService,
        { provide: ProcessHeatingAssessmentService, useValue: new FakeProcessHeatingAssessmentService(BASELINE) },
        { provide: ProcessHeatingUiService, useClass: FakeProcessHeatingUiService },
        { provide: ModalDialogService, useValue: modalDialogService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    modificationService = TestBed.inject(ModificationService);
    assessmentService = TestBed.inject(ProcessHeatingAssessmentService) as unknown as FakeProcessHeatingAssessmentService;
    modificationService.addModification('Scenario 1');

    fixture = TestBed.createComponent(OperationsOpportunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('template visibility', () => {
    it('hides the sections when the opportunity is not selected', () => {
      expect(component.useOpportunity()).toBe(false);

      expect(fixture.nativeElement.querySelector('ul')).toBeNull();
    });

    it('renders the four collapsed section checkboxes when the opportunity is selected', () => {
      component.toggleOpportunity(true);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('.explore-opps-item').length).toBe(4);
      expect(fixture.nativeElement.textContent).toContain('Modify Operating Hours');
      expect(fixture.nativeElement.textContent).toContain('Modify Fuel Costs');
      expect(fixture.nativeElement.textContent).toContain('Modify Steam Costs');
      expect(fixture.nativeElement.textContent).toContain('Modify Electricity Costs');
      expect(fixture.nativeElement.querySelector('#modification_fuelCost')).toBeNull();
    });

    it('shows the baseline and modification inputs once a section is expanded', () => {
      component.toggleOpportunity(true);
      component.toggleSection('fuelCost', true);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('#modification_fuelCost')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('#modification_steamCost')).toBeNull();
    });

    it('offers the operating hours calculator only in the hours section', () => {
      component.toggleOpportunity(true);
      component.toggleSection('operatingHours', true);
      component.toggleSection('fuelCost', true);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('.fa-calculator').length).toBe(1);
    });
  });

  describe('selecting the opportunity', () => {
    it('sets the Adjust Operational Data flag on the modification', () => {
      component.toggleOpportunity(true);

      expect(component.useOpportunity()).toBe(true);
      expect(modificationService.selectedModification().exploreOpportunityFlags.operations)
        .toEqual({ hasOpportunity: true, display: 'Adjust Operational Data' });
    });

    it('resets every section to baseline and collapses them when deselected', () => {
      component.toggleOpportunity(true);
      component.toggleSection('operatingHours', true);
      component.toggleSection('fuelCost', true);
      component.setModificationValue('operatingHours', 4000);
      component.setModificationValue('fuelCost', 9);

      component.toggleOpportunity(false);

      expect(component.useOpportunity()).toBe(false);
      expect(effective().operatingHours.hoursPerYear).toBe(8736);
      expect(effective().operatingCosts.fuelCost).toBe(3.5);
      expect(component.sections().every(section => !section.expanded)).toBe(true);
    });
  });

  describe('editing values', () => {
    beforeEach(() => component.toggleOpportunity(true));

    it('writes a modified operating hours value to the modification overrides', () => {
      component.setModificationValue('operatingHours', 4000);

      expect(effective().operatingHours.hoursPerYear).toBe(4000);
      expect(effective().operatingHours.daysPerWeek).toBe(7);
      expect(BASELINE.operatingHours.hoursPerYear).toBe(8736);
    });

    for (const [section, baselineValue] of [['fuelCost', 3.5], ['steamCost', 10], ['electricityCost', 0.066]] as const) {
      it(`writes a modified ${section} without changing the other costs`, () => {
        component.setModificationValue(section, 42);

        const costs = effective().operatingCosts;
        expect(costs[section]).toBe(42);
        for (const other of (['fuelCost', 'steamCost', 'electricityCost'] as const).filter(cost => cost !== section)) {
          expect(costs[other]).toBe(BASELINE.operatingCosts[other]);
        }
        expect(sectionState(section).baselineValue).toBe(baselineValue);
        expect(sectionState(section).modificationValue).toBe(42);
      });
    }

    it('ignores operating hours below 0 or above 8760', () => {
      component.setModificationValue('operatingHours', -1);
      component.setModificationValue('operatingHours', 8761);

      expect(effective().operatingHours.hoursPerYear).toBe(8736);
    });

    it('warns that an out-of-range entry is not applied, and clears the warning on a valid entry', () => {
      component.toggleSection('operatingHours', true);

      component.setModificationValue('operatingHours', 9000);
      fixture.detectChanges();
      expect(sectionState('operatingHours').warning).toContain('between 0 and 8760');
      expect(fixture.nativeElement.querySelector('.alert-warning')).not.toBeNull();

      component.setModificationValue('operatingHours', 4000);
      fixture.detectChanges();
      expect(sectionState('operatingHours').warning).toBeNull();
      expect(fixture.nativeElement.querySelector('.alert-warning')).toBeNull();
    });

    it('warns about a negative cost only in the section it was entered in', () => {
      component.setModificationValue('steamCost', -5);

      expect(sectionState('steamCost').warning).toContain('Steam cost must be 0 or greater');
      expect(sectionState('fuelCost').warning).toBeNull();
    });

    it('clears the warning when its section is closed or the opportunity is deselected', () => {
      component.setModificationValue('fuelCost', -1);
      component.setModificationValue('steamCost', -1);

      component.toggleSection('fuelCost', false);
      expect(sectionState('fuelCost').warning).toBeNull();

      component.toggleOpportunity(false);
      expect(sectionState('steamCost').warning).toBeNull();
    });

    it('clears the warning when a different modification is selected', () => {
      component.setModificationValue('fuelCost', -1);

      modificationService.addModification('Scenario 2');

      expect(sectionState('fuelCost').warning).toBeNull();
    });

    it('accepts the operating hours bounds 0 and 8760', () => {
      component.setModificationValue('operatingHours', 0);
      expect(effective().operatingHours.hoursPerYear).toBe(0);

      component.setModificationValue('operatingHours', 8760);
      expect(effective().operatingHours.hoursPerYear).toBe(8760);
    });

    for (const section of ['fuelCost', 'steamCost', 'electricityCost'] as const) {
      it(`ignores a negative ${section}`, () => {
        component.setModificationValue(section, -0.01);

        expect(effective().operatingCosts[section]).toBe(BASELINE.operatingCosts[section]);
      });
    }

    it('accepts a cost of 0', () => {
      component.setModificationValue('fuelCost', 0);

      expect(effective().operatingCosts.fuelCost).toBe(0);
    });

    it('ignores a cleared input', () => {
      component.setModificationValue('fuelCost', NaN);

      expect(effective().operatingCosts.fuelCost).toBe(3.5);
    });
  });

  describe('sections', () => {
    beforeEach(() => component.toggleOpportunity(true));

    it('resets only the section that is closed', () => {
      component.toggleSection('operatingHours', true);
      component.toggleSection('fuelCost', true);
      component.setModificationValue('operatingHours', 4000);
      component.setModificationValue('fuelCost', 9);

      component.toggleSection('fuelCost', false);

      expect(effective().operatingCosts.fuelCost).toBe(3.5);
      expect(effective().operatingHours.hoursPerYear).toBe(4000);
      expect(sectionState('fuelCost').expanded).toBe(false);
      expect(sectionState('operatingHours').expanded).toBe(true);
    });

    it('does not write overrides when closing a section that already matches baseline', () => {
      component.toggleSection('fuelCost', true);
      const writeSpy = spyOn(assessmentService, 'updateModificationProperty').and.callThrough();

      component.toggleSection('fuelCost', false);

      expect(writeSpy).not.toHaveBeenCalled();
    });

    it('resets the whole operating hours object when the hours section is closed', () => {
      component.toggleSection('operatingHours', true);
      assessmentService.updateModificationProperty(modificationService.selectedModificationId(), 'operatingHours', { ...BASELINE.operatingHours, daysPerWeek: 5, hoursPerYear: 4000 });

      component.toggleSection('operatingHours', false);

      expect(effective().operatingHours).toEqual(BASELINE.operatingHours);
    });

    it('resets the whole operating hours object when the opportunity is deselected', () => {
      assessmentService.updateModificationProperty(modificationService.selectedModificationId(), 'operatingHours', { ...BASELINE.operatingHours, daysPerWeek: 5, hoursPerYear: 8736 });

      component.toggleOpportunity(false);

      expect(effective().operatingHours).toEqual(BASELINE.operatingHours);
    });

    it('expands the sections that already differ from baseline when a modification is selected', () => {
      const secondId = modificationService.addModification('Scenario 2');
      assessmentService.updateModificationProperty(secondId, 'operatingCosts', { ...BASELINE.operatingCosts, steamCost: 12 });
      modificationService.selectModification(modificationService.modifications()[0].id);
      modificationService.selectModification(secondId);

      expect(sectionState('steamCost').expanded).toBe(true);
      expect(sectionState('fuelCost').expanded).toBe(false);
      expect(sectionState('operatingHours').expanded).toBe(false);
      expect(sectionState('electricityCost').expanded).toBe(false);
    });
  });

  describe('operating hours calculator', () => {
    it('saves the hours returned by the modal into the modification', () => {
      modalDialogService.openModal.and.returnValue({ closed: of(MODAL_HOURS) } as unknown as DialogRef<OperatingHours, OperatingHoursComponent>);
      component.toggleOpportunity(true);

      component.openOperatingHoursModal();

      expect(effective().operatingHours).toEqual(jasmine.objectContaining(MODAL_HOURS));
      expect(BASELINE.operatingHours.hoursPerYear).toBe(8736);
    });

    it('opens the calculator from the labelled button in the hours section', () => {
      modalDialogService.openModal.and.returnValue({ closed: of(undefined) } as unknown as DialogRef<OperatingHours, OperatingHoursComponent>);
      component.toggleOpportunity(true);
      component.toggleSection('operatingHours', true);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('button[aria-label="Open operating hours calculator"]').click();

      expect(modalDialogService.openModal).toHaveBeenCalledTimes(1);
    });

    it('ignores the modal result after the component is destroyed', () => {
      const closed = new Subject<OperatingHours>();
      modalDialogService.openModal.and.returnValue({ closed } as unknown as DialogRef<OperatingHours, OperatingHoursComponent>);
      component.toggleOpportunity(true);
      component.openOperatingHoursModal();

      fixture.destroy();
      closed.next(MODAL_HOURS);

      expect(effective().operatingHours.hoursPerYear).toBe(8736);
    });

    it('leaves the hours unchanged when the modal is dismissed', () => {
      modalDialogService.openModal.and.returnValue({ closed: of(undefined) } as unknown as DialogRef<OperatingHours, OperatingHoursComponent>);
      component.toggleOpportunity(true);

      component.openOperatingHoursModal();

      expect(effective().operatingHours.hoursPerYear).toBe(8736);
    });
  });
});
