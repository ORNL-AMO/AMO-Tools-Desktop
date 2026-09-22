import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SolidLoadMaterialDbService } from '../../../indexedDb/solid-load-material-db.service';
import { SolidLoadChargeMaterial } from '../../../shared/models/materials';
import { FixtureLoss } from '../../../shared/models/phast/losses/fixtureLoss';
import { PHAST } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { FakeProcessHeatingAssessmentService, FakeProcessHeatingUiService } from '../opportunity-test-fakes';
import { FixtureMaterialsHandlingOpportunityComponent } from './fixture-materials-handling-opportunity.component';

const MATERIALS: SolidLoadChargeMaterial[] = [
  { id: 1, substance: 'Steel', specificHeatSolid: 0.12, latentHeat: 120, meltingPoint: 2800, specificHeatLiquid: 0.18 },
  { id: 2, substance: 'Aluminum', specificHeatSolid: 0.25, latentHeat: 170, meltingPoint: 1220, specificHeatLiquid: 0.26 },
];

const BASELINE: PHAST = {
  name: 'Baseline',
  losses: {
    fixtureLosses: [
      { id: 'fix-1', name: 'Fixture 1', materialName: 1, specificHeat: 0.12, feedRate: 500, initialTemperature: 70, finalTemperature: 1000 },
    ],
  },
  modifications: [],
};

describe('FixtureMaterialsHandlingOpportunityComponent', () => {
  let fixture: ComponentFixture<FixtureMaterialsHandlingOpportunityComponent>;
  let component: FixtureMaterialsHandlingOpportunityComponent;
  let modificationService: ModificationService;
  let assessmentService: FakeProcessHeatingAssessmentService;

  function effectiveLoss(): FixtureLoss {
    return assessmentService.lossSignal(modificationService.selectedModificationId(), 'fixtureLosses')[0] as FixtureLoss;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FixtureMaterialsHandlingOpportunityComponent],
      providers: [
        ModificationService,
        { provide: ProcessHeatingAssessmentService, useValue: new FakeProcessHeatingAssessmentService(BASELINE) },
        { provide: ProcessHeatingUiService, useClass: FakeProcessHeatingUiService },
        { provide: SolidLoadMaterialDbService, useValue: { getAllWithObservable: () => of(MATERIALS) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    modificationService = TestBed.inject(ModificationService);
    assessmentService = TestBed.inject(ProcessHeatingAssessmentService) as unknown as FakeProcessHeatingAssessmentService;
    modificationService.addModification('Scenario 1');

    fixture = TestBed.createComponent(FixtureMaterialsHandlingOpportunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.toggleOpportunity(true);
    fixture.detectChanges();
  });

  it('renders the feed rate and material section checkboxes for each fixture', () => {
    expect(fixture.nativeElement.textContent).toContain('Modify Fixture Weight Feed Rate');
    expect(fixture.nativeElement.textContent).toContain('Modify Material Type');
  });

  it('shows the baseline material by name', () => {
    component.toggleSection('material', 'fix-1', true);
    fixture.detectChanges();

    expect(component.comparisons()[0].baselineMaterialName).toBe('Steel');
    expect(fixture.nativeElement.textContent).toContain('Steel');
  });

  it('sets specific heat from the database when the modification material changes', () => {
    component.setMaterial('fix-1', 2);

    expect(effectiveLoss()).toEqual(jasmine.objectContaining({ materialName: 2, specificHeat: 0.25 }));
  });

  it('restores both material and specific heat when the material section is closed', () => {
    component.toggleSection('material', 'fix-1', true);
    component.setMaterial('fix-1', 2);

    component.toggleSection('material', 'fix-1', false);

    expect(effectiveLoss()).toEqual(jasmine.objectContaining({ materialName: 1, specificHeat: 0.12 }));
  });

  it('resets only the feed rate when the feed rate section is closed', () => {
    component.toggleSection('feedRate', 'fix-1', true);
    component.setFeedRate('fix-1', 300);
    component.setMaterial('fix-1', 2);

    component.toggleSection('feedRate', 'fix-1', false);

    expect(effectiveLoss()).toEqual(jasmine.objectContaining({ feedRate: 500, materialName: 2 }));
  });

  it('warns on a negative modification feed rate', () => {
    component.toggleSection('feedRate', 'fix-1', true);
    component.setFeedRate('fix-1', -10);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Fixture Feed Rate must be greater than 0');
    expect(component.comparisons()[0].baselineFeedRateWarning).toBeNull();
  });
});
