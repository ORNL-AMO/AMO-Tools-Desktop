import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { HeatingEquipmentConfiguration } from '../models/views';
import { ModificationService } from '../services/modification.service';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { ExploreOpportunitiesComponent } from './explore-opportunities.component';
import { OPPORTUNITY_REGISTRY } from './opportunity-registry';
import { GasLeakageOpportunityComponent } from './gas-leakage-opportunity/gas-leakage-opportunity.component';
import { AirFuelRatioOpportunityComponent } from './air-fuel-ratio-opportunity/air-fuel-ratio-opportunity.component';
import { PreheatCombustionAirOpportunityComponent } from './preheat-combustion-air-opportunity/preheat-combustion-air-opportunity.component';

describe('ExploreOpportunitiesComponent opportunity registry', () => {
  let configuration: WritableSignal<HeatingEquipmentConfiguration>;
  let baselineLosses: () => unknown[];
  const fuelFiredComponents = [GasLeakageOpportunityComponent, AirFuelRatioOpportunityComponent, PreheatCombustionAirOpportunityComponent];

  beforeEach(() => {
    baselineLosses = () => [{}];
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
            lossSignal: () => baselineLosses(),
          },
        },
      ],
    });
  });

  it('renders every registered component in registry order when baseline has data', () => {
    const component = TestBed.createComponent(ExploreOpportunitiesComponent).componentInstance;

    expect(component.visibleOpportunityComponents()).toEqual(OPPORTUNITY_REGISTRY.flatMap(entry => entry.opportunityComponents));
  });

  it('hides all opportunities when baseline has no losses', () => {
    baselineLosses = () => [];
    const component = TestBed.createComponent(ExploreOpportunitiesComponent).componentInstance;

    expect(component.visibleOpportunityComponents()).toEqual([]);
  });

  for (const otherConfiguration of Object.values(HeatingEquipmentConfiguration)
    .filter(value => value !== HeatingEquipmentConfiguration.FUEL_FIRED)) {
    it(`hides leakage and flue gas opportunities for ${otherConfiguration} even with baseline data`, () => {
      configuration.set(otherConfiguration);
      const component = TestBed.createComponent(ExploreOpportunitiesComponent).componentInstance;
      const visible = component.visibleOpportunityComponents();

      for (const fuelFiredComponent of fuelFiredComponents) {
        expect(visible).not.toContain(fuelFiredComponent);
      }
      expect(visible.length).toBeGreaterThan(0);
    });
  }
});
