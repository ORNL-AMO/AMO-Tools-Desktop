import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { Modification } from '../../../shared/models/process-cooling-assessment';
import { ProcessCoolingAssessmentService } from '../services/process-cooling-assessment.service';
import { ProcessCoolingUiService } from '../services/process-cooling-ui.service';
import { ModificationService } from '../services/modification.service';
import { ExploreOpportunitiesFormService } from '../services/explore-opportunities-form.service';
import { SystemInformationFormService } from '../system-information/system-information-form.service';
import { IncreaseChilledTemperatureComponent } from './increase-chilled-temperature/increase-chilled-temperature.component';
import { DecreaseCondenserWaterTempComponent } from './decrease-condenser-water-temp/decrease-condenser-water-temp.component';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', powerMeasurement: 'kW' } as Settings;
const BASELINE_VALUES = {
  increaseChilledWaterTemp: { chilledWaterSupplyTemp: 44 },
  decreaseCondenserWaterTemp: { condenserWaterTemp: 85 },
};

function makeModification(chilledWaterTemperature = 44, condenserWaterTemperature = 85): Modification {
  return {
    increaseChilledWaterTemp: { chilledWaterSupplyTemp: chilledWaterTemperature, useOpportunity: false },
    decreaseCondenserWaterTemp: { condenserWaterTemp: condenserWaterTemperature, useOpportunity: false },
    useSlidingCondenserWaterTemp: { followingTempDifferential: 10, isConstantCondenserWaterTemp: false, useOpportunity: false },
  } as Modification;
}

describe('temperature EEM inputs', () => {
  let selectedModification: Subject<Modification>;

  beforeEach(async () => {
    selectedModification = new Subject<Modification>();
    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [IncreaseChilledTemperatureComponent, DecreaseCondenserWaterTempComponent],
      providers: [
        {
          provide: ProcessCoolingAssessmentService,
          useValue: { settingsSignal: signal(MOCK_SETTINGS) },
        },
        {
          provide: ModificationService,
          useValue: {
            selectedModification$: selectedModification.asObservable(),
            getBaselineExploreOppsValues: () => BASELINE_VALUES,
            updateModificationEEM: jasmine.createSpy('updateModificationEEM'),
          },
        },
        { provide: ProcessCoolingUiService, useValue: { focusedFieldSignal: signal('') } },
        ExploreOpportunitiesFormService,
        SystemInformationFormService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  function createChilledTemperatureComponent(): {
    component: IncreaseChilledTemperatureComponent;
    fixture: ComponentFixture<IncreaseChilledTemperatureComponent>;
  } {
    const fixture = TestBed.createComponent(IncreaseChilledTemperatureComponent);
    fixture.detectChanges();
    return { component: fixture.componentInstance, fixture };
  }

  function createCondenserTemperatureComponent(): {
    component: DecreaseCondenserWaterTempComponent;
    fixture: ComponentFixture<DecreaseCondenserWaterTempComponent>;
  } {
    const fixture = TestBed.createComponent(DecreaseCondenserWaterTempComponent);
    fixture.detectChanges();
    return { component: fixture.componentInstance, fixture };
  }

  it('does not re-patch the chilled-water input when the selected modification has the same value', () => {
    const { component } = createChilledTemperatureComponent();
    component.chilledWaterTemperature.setValue(45.25);
    const patchValue = spyOn(component.form, 'patchValue').and.callThrough();

    selectedModification.next(makeModification(45.25));

    expect(patchValue).not.toHaveBeenCalled();
  });

  it('applies a changed selected-modification value to the chilled-water input', () => {
    const { component } = createChilledTemperatureComponent();
    component.chilledWaterTemperature.setValue(45.25);
    const patchValue = spyOn(component.form, 'patchValue').and.callThrough();

    selectedModification.next(makeModification(46));

    expect(patchValue).toHaveBeenCalledWith({ chilledWaterTemperature: 46 }, { emitEvent: false });
  });

  it('does not re-patch the condenser-water input when the selected modification has the same value', () => {
    const { component } = createCondenserTemperatureComponent();
    component.condenserWaterTemperature.setValue(84.75);
    const patchValue = spyOn(component.form, 'patchValue').and.callThrough();

    selectedModification.next(makeModification(44, 84.75));

    expect(patchValue).not.toHaveBeenCalled();
  });

  it('applies a changed selected-modification value to the condenser-water input', () => {
    const { component } = createCondenserTemperatureComponent();
    component.condenserWaterTemperature.setValue(84.75);
    const patchValue = spyOn(component.form, 'patchValue').and.callThrough();

    selectedModification.next(makeModification(44, 84));

    expect(patchValue).toHaveBeenCalledWith({ condenserWaterTemperature: 84 }, { emitEvent: false });
  });
});
