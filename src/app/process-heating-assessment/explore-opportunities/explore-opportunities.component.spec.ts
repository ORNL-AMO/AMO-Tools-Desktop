import { Component, NO_ERRORS_SCHEMA, signal, Type, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { Losses } from '../models/phast';
import { HeatingEquipmentConfiguration } from '../models/views';
import { ModificationService } from '../services/modification.service';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { ExploreOpportunitiesComponent } from './explore-opportunities.component';
import { OPPORTUNITY_REGISTRY } from './opportunity-registry';
import { ChargeMaterialOpportunityComponent } from './charge-material-opportunity/charge-material-opportunity.component';
import { WallLossOpportunityComponent } from './wall-loss-opportunity/wall-loss-opportunity.component';
import { AtmosphereOpportunityComponent } from './atmosphere-opportunity/atmosphere-opportunity.component';
import { FixtureMaterialsHandlingOpportunityComponent } from './fixture-materials-handling-opportunity/fixture-materials-handling-opportunity.component';
import { FixtureCoolingOpportunityComponent } from './fixture-cooling-opportunity/fixture-cooling-opportunity.component';
import { CoolingOpportunityComponent } from './cooling-opportunity/cooling-opportunity.component';
import { OpeningSizeOpportunityComponent } from './opening-size-opportunity/opening-size-opportunity.component';
import { OpeningEmissivityOpportunityComponent } from './opening-emissivity-opportunity/opening-emissivity-opportunity.component';
import { OpeningTimeOpenOpportunityComponent } from './opening-time-open-opportunity/opening-time-open-opportunity.component';
import { GasLeakageOpportunityComponent } from './gas-leakage-opportunity/gas-leakage-opportunity.component';
import { AirFuelRatioOpportunityComponent } from './air-fuel-ratio-opportunity/air-fuel-ratio-opportunity.component';
import { PreheatCombustionAirOpportunityComponent } from './preheat-combustion-air-opportunity/preheat-combustion-air-opportunity.component';

const COMPONENTS_BY_LOSS_KEY: Partial<Record<keyof Losses, Type<unknown>[]>> = {
  chargeMaterials: [ChargeMaterialOpportunityComponent],
  wallLosses: [WallLossOpportunityComponent],
  atmosphereLosses: [AtmosphereOpportunityComponent],
  fixtureLosses: [FixtureMaterialsHandlingOpportunityComponent, FixtureCoolingOpportunityComponent],
  coolingLosses: [CoolingOpportunityComponent],
  openingLosses: [OpeningSizeOpportunityComponent, OpeningEmissivityOpportunityComponent, OpeningTimeOpenOpportunityComponent],
  leakageLosses: [GasLeakageOpportunityComponent],
  flueGasLosses: [AirFuelRatioOpportunityComponent, PreheatCombustionAirOpportunityComponent],
};

const FUEL_FIRED_ONLY_COMPONENTS = [
  ...COMPONENTS_BY_LOSS_KEY.leakageLosses!,
  ...COMPONENTS_BY_LOSS_KEY.flueGasLosses!,
];

const ALL_COMPONENTS_IN_ORDER = Object.values(COMPONENTS_BY_LOSS_KEY).flat();

@Component({ selector: 'app-first-stub-opportunity', template: '', standalone: false })
class FirstStubOpportunityComponent {}

@Component({ selector: 'app-second-stub-opportunity', template: '', standalone: false })
class SecondStubOpportunityComponent {}

describe('ExploreOpportunitiesComponent opportunity registry', () => {
  let configuration: WritableSignal<HeatingEquipmentConfiguration>;
  let populatedLossKeys: Set<keyof Losses>;

  function createComponent(): ExploreOpportunitiesComponent {
    return TestBed.createComponent(ExploreOpportunitiesComponent).componentInstance;
  }

  beforeEach(() => {
    populatedLossKeys = new Set(Object.keys(COMPONENTS_BY_LOSS_KEY) as (keyof Losses)[]);
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
            lossSignal: (_scenario: string, lossKey: keyof Losses) => populatedLossKeys.has(lossKey) ? [{}] : [],
          },
        },
      ],
    });
  });

  it('registers every opportunity component in the original template order', () => {
    expect(OPPORTUNITY_REGISTRY.flatMap(entry => entry.opportunityComponents.map(({ component }) => component)))
      .toEqual(ALL_COMPONENTS_IN_ORDER);
  });

  it('shows every opportunity in order for fuel-fired with all baseline losses', () => {
    expect(createComponent().visibleOpportunityComponents()).toEqual(ALL_COMPONENTS_IN_ORDER);
  });

  it('hides all opportunities when baseline has no losses', () => {
    populatedLossKeys.clear();

    expect(createComponent().visibleOpportunityComponents()).toEqual([]);
  });

  for (const [lossKey, components] of Object.entries(COMPONENTS_BY_LOSS_KEY) as [keyof Losses, Type<unknown>[]][]) {
    it(`shows only ${lossKey} opportunities when only that loss type has baseline data`, () => {
      populatedLossKeys = new Set([lossKey]);

      expect(createComponent().visibleOpportunityComponents()).toEqual(components);
    });
  }

  for (const otherConfiguration of Object.values(HeatingEquipmentConfiguration)
    .filter(value => value !== HeatingEquipmentConfiguration.FUEL_FIRED)) {
    it(`hides leakage and flue gas opportunities for ${otherConfiguration} even with baseline data`, () => {
      configuration.set(otherConfiguration);
      const visible = createComponent().visibleOpportunityComponents();

      expect(visible).toEqual(ALL_COMPONENTS_IN_ORDER.filter(component => !FUEL_FIRED_ONLY_COMPONENTS.includes(component)));
    });
  }

  it('renders visible opportunities through NgComponentOutlet in order', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [ExploreOpportunitiesComponent, FirstStubOpportunityComponent, SecondStubOpportunityComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ModalDialogService, useValue: {} },
        { provide: ModificationService, useValue: { selectedModification: signal({ id: 'mod' }), modifications: signal([]) } },
        {
          provide: ProcessHeatingAssessmentService,
          useValue: { heatingEquipmentConfiguration: configuration, lossSignal: () => [{}] },
        },
      ],
    });
    const fixture = TestBed.createComponent(ExploreOpportunitiesComponent);
    spyOn(fixture.componentInstance, 'visibleOpportunityComponents').and.returnValue([SecondStubOpportunityComponent, FirstStubOpportunityComponent]);
    fixture.detectChanges();

    const rendered = fixture.debugElement.queryAll(By.css('app-first-stub-opportunity, app-second-stub-opportunity'));
    expect(rendered.map(element => element.nativeElement.tagName.toLowerCase()))
      .toEqual(['app-second-stub-opportunity', 'app-first-stub-opportunity']);
  });
});
