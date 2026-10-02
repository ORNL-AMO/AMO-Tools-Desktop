import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { HeatingEquipmentConfiguration } from '../models/views';
import { ModificationService } from '../services/modification.service';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { ExploreOpportunitiesComponent } from './explore-opportunities.component';

describe('ExploreOpportunitiesComponent fuel-fired gating', () => {
  let configuration: WritableSignal<HeatingEquipmentConfiguration>;

  beforeEach(() => {
    configuration = signal<HeatingEquipmentConfiguration>(HeatingEquipmentConfiguration.FUEL_FIRED);
    TestBed.configureTestingModule({
      declarations: [ExploreOpportunitiesComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ModalDialogService, useValue: {} },
        { provide: ModificationService, useValue: { selectedModification: signal(undefined), modifications: signal([]) } },
        {
          provide: ProcessHeatingAssessmentService,
          useValue: {
            heatingEquipmentConfiguration: configuration,
            lossSignal: () => [{}],
          },
        },
      ],
    });
  });

  it('shows leakage and flue gas opportunities for fuel-fired with baseline data', () => {
    const component = TestBed.createComponent(ExploreOpportunitiesComponent).componentInstance;

    expect(component.hasLeakageLosses()).toBeTrue();
    expect(component.hasFlueGasLosses()).toBeTrue();
  });

  for (const otherConfiguration of Object.values(HeatingEquipmentConfiguration)
    .filter(value => value !== HeatingEquipmentConfiguration.FUEL_FIRED)) {
    it(`hides leakage and flue gas opportunities for ${otherConfiguration} even with baseline data`, () => {
      configuration.set(otherConfiguration);
      const component = TestBed.createComponent(ExploreOpportunitiesComponent).componentInstance;

      expect(component.hasLeakageLosses()).toBeFalse();
      expect(component.hasFlueGasLosses()).toBeFalse();
    });
  }
});
