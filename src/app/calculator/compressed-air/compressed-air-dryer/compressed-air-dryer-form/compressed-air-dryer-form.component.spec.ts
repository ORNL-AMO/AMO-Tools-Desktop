import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';

import { CompressedAirDryerFormComponent } from './compressed-air-dryer-form.component';
import { CompressedAirDryerService } from '../compressed-air-dryer.service';
import { ConvertCompressedAirDryerService } from '../convert-compressed-air-dryer.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { CompressedAirDryersSuiteApiService } from '../../../../tools-suite-api/compressed-air-dryer-suite-api.service';
import { DryerOperatingCostInput, DryerType, PurgeInputMode } from '../../../../shared/models/standalone';
import { Settings } from '../../../../shared/models/settings';
import { OperatingHours } from '../../../../shared/models/operations';
import { getDryerTypeDefaults, getMinimumPurgeAirRate } from '../compressed-air-dryer-type-config';

function makeInput(dryerType: DryerType = DryerType.Heatless, overrides: Partial<DryerOperatingCostInput> = {}): DryerOperatingCostInput {
  return {
    dryerType,
    annualOperatingHours: 8760,
    flowRate: 1000,
    pressure: 100,
    temperature: 75,
    costOfElectricity: 0.08,
    costOfCompressedAir: 0.5,
    costOfCoolingWater: 0.5,
    ...getDryerTypeDefaults(dryerType),
    ...overrides,
  } as DryerOperatingCostInput;
}

describe('CompressedAirDryerFormComponent', () => {
  let component: CompressedAirDryerFormComponent;
  let fixture: ComponentFixture<CompressedAirDryerFormComponent>;
  let dryerService: CompressedAirDryerService;
  let calculateSpy: jasmine.Spy;

  const imperial = { unitsOfMeasure: 'Imperial' } as Settings;
  const metric = { unitsOfMeasure: 'Metric' } as Settings;

  function setForm(input: DryerOperatingCostInput, settings: Settings = imperial): UntypedFormGroup {
    const form = dryerService.getFormFromObj(input, settings);
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('settings', settings);
    fixture.detectChanges();
    return form;
  }

  function query(controlName: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(`[formControlName="${controlName}"]`);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [CompressedAirDryerFormComponent],
      providers: [
        CompressedAirDryerService,
        ConvertCompressedAirDryerService,
        ConvertUnitsService,
        { provide: CompressedAirDryersSuiteApiService, useValue: jasmine.createSpyObj('CompressedAirDryersSuiteApiService', ['dryerOperatingCost']) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    dryerService = TestBed.inject(CompressedAirDryerService);
    fixture = TestBed.createComponent(CompressedAirDryerFormComponent);
    component = fixture.componentInstance;
    calculateSpy = jasmine.createSpy('calculate');
    component.calculate.subscribe(calculateSpy);
  });

  describe('template visibility', () => {
    it('shows purge and regeneration fields for a Heatless dryer', () => {
      setForm(makeInput(DryerType.Heatless));

      expect(query('purgeInputMode')).not.toBeNull();
      expect(query('purgeRate')).not.toBeNull();
      expect(query('purgeFlowRate')).toBeNull();
      expect(query('designDDCPercentage')).not.toBeNull();
      expect(query('heaterMode')).toBeNull();
      expect(query('motorMode')).toBeNull();
      expect(query('costOfCoolingWater')).toBeNull();
    });

    it('shows motor and cooling water fields for a Refrigerated dryer', () => {
      setForm(makeInput(DryerType.Refrigerated));

      expect(query('costOfCoolingWater')).not.toBeNull();
      expect(query('motorMode')).not.toBeNull();
      expect(query('purgeInputMode')).toBeNull();
      expect(query('designDDCPercentage')).toBeNull();
    });

    it('hides the heater power while the heater sizing is automatic', () => {
      setForm(makeInput(DryerType.HeatedExternally));

      expect(query('heaterMode')).not.toBeNull();
      expect(query('heatingHoursPerDay')).not.toBeNull();
      expect(query('heaterPower')).toBeNull();
    });

    it('shows the calculated heater note without a sizing select for Heat of Compression (HC)', () => {
      setForm(makeInput(DryerType.HeatOfCompressionHC));

      expect(fixture.nativeElement.textContent).toContain('Heater power is calculated automatically');
      expect(query('heaterMode')).toBeNull();
      expect(query('heaterPower')).toBeNull();
    });

    it('shows metric units for metric settings', () => {
      setForm(makeInput(DryerType.Heatless), metric);

      expect(fixture.nativeElement.textContent).toContain('m3/min');
      expect(fixture.nativeElement.textContent).not.toContain('SCFM');
    });
  });

  describe('changeDryerType', () => {
    it('applies the new type defaults and recalculates', () => {
      const form = setForm(makeInput(DryerType.Heatless));
      form.controls.dryerType.setValue(DryerType.HeatOfCompressionSP);

      component.changeDryerType();

      expect(form.controls.designDDCPercentage.value).toBe(4);
      expect(form.controls.regenerationCycleLength.value).toBe(2);
      expect(calculateSpy).toHaveBeenCalledWith(true);
    });

    it('keeps the shared operating and utility values', () => {
      const form = setForm(makeInput(DryerType.Heatless, { flowRate: 1234, costOfElectricity: 0.12 }));
      form.controls.dryerType.setValue(DryerType.Refrigerated);

      component.changeDryerType();

      expect(form.controls.flowRate.value).toBe(1234);
      expect(form.controls.costOfElectricity.value).toBe(0.12);
    });

    it('turns off the purge validation when switching to a type without purge', () => {
      const form = setForm(makeInput(DryerType.Heatless));
      form.controls.purgeRate.setValue(null);
      expect(form.valid).toBeFalse();

      form.controls.dryerType.setValue(DryerType.Refrigerated);
      component.changeDryerType();

      expect(form.controls.purgeRate.disabled).toBeTrue();
      expect(form.controls.costOfCoolingWater.enabled).toBeTrue();
      expect(form.valid).toBeTrue();
    });

    it('turns the purge validation back on when switching to a type with purge', () => {
      const form = setForm(makeInput(DryerType.Refrigerated));
      form.controls.dryerType.setValue(DryerType.Heatless);

      component.changeDryerType();

      expect(form.controls.purgeRate.enabled).toBeTrue();
      expect(form.controls.costOfCoolingWater.disabled).toBeTrue();
      form.controls.purgeRate.setValue(null);
      expect(form.valid).toBeFalse();
    });
  });

  describe('changeMode', () => {
    it('switches to direct purge flow and clears a zero value so it must be entered', () => {
      const form = setForm(makeInput(DryerType.Heatless));
      form.controls.purgeInputMode.setValue(PurgeInputMode.DirectFlow);

      component.changeMode('purgeFlowRate');

      expect(form.controls.purgeRate.disabled).toBeTrue();
      expect(form.controls.purgeFlowRate.enabled).toBeTrue();
      expect(form.controls.purgeFlowRate.value).toBeNull();
      expect(form.controls.purgeFlowRate.dirty).toBeTrue();
      expect(calculateSpy).toHaveBeenCalledWith(true);
    });

    it('switches back to percent of capacity', () => {
      const form = setForm(makeInput(DryerType.Heatless, { purgeInputMode: PurgeInputMode.DirectFlow, purgeFlowRate: 100 }));
      form.controls.purgeInputMode.setValue(PurgeInputMode.PercentOfDryerCapacity);

      component.changeMode('purgeRate');

      expect(form.controls.purgeRate.enabled).toBeTrue();
      expect(form.controls.purgeFlowRate.disabled).toBeTrue();
      expect(form.controls.purgeRate.value).toBe(15);
    });

    it('shows and requires the heater power when manual sizing is selected', () => {
      const form = setForm(makeInput(DryerType.HeatedExternally));
      form.controls.heaterMode.setValue('manual');

      component.changeMode('heaterPower');
      fixture.detectChanges();

      expect(form.controls.heaterPower.enabled).toBeTrue();
      expect(form.controls.heaterPower.value).toBeNull();
      expect(form.valid).toBeFalse();
      expect(query('heaterPower')).not.toBeNull();
    });

    it('hides the heater power again when automatic sizing is selected', () => {
      const form = setForm(makeInput(DryerType.HeatedExternally, { heaterPower: 40 }));
      expect(form.controls.heaterMode.value).toBe('manual');
      form.controls.heaterMode.setValue('auto');

      component.changeMode('heaterPower');
      fixture.detectChanges();

      expect(form.controls.heaterPower.disabled).toBeTrue();
      expect(form.valid).toBeTrue();
      expect(query('heaterPower')).toBeNull();
    });
  });

  describe('changeFlowRate', () => {
    it('flags a direct purge flow that now exceeds the flow rate', () => {
      const form = setForm(makeInput(DryerType.Heatless, { purgeInputMode: PurgeInputMode.DirectFlow, purgeFlowRate: 200 }));
      expect(form.controls.purgeFlowRate.valid).toBeTrue();
      form.controls.flowRate.setValue(100);

      component.changeFlowRate();

      expect(form.controls.purgeFlowRate.errors?.max).toBeDefined();
      expect(form.controls.purgeFlowRate.dirty).toBeTrue();
      expect(calculateSpy).toHaveBeenCalledWith(true);
    });

    it('clears the purge flow error once the flow rate is raised again', () => {
      const form = setForm(makeInput(DryerType.Heatless, { purgeInputMode: PurgeInputMode.DirectFlow, purgeFlowRate: 200 }));
      form.controls.flowRate.setValue(100);
      component.changeFlowRate();

      form.controls.flowRate.setValue(500);
      component.changeFlowRate();

      expect(form.controls.purgeFlowRate.valid).toBeTrue();
    });
  });

  describe('minimumPurgeAirRateWarning', () => {
    it('warns when the compressed air rate is below the electricity-based minimum', () => {
      setForm(makeInput(DryerType.Heatless, { costOfElectricity: 0.1, costOfCompressedAir: 0.01 }));

      const warning = component.minimumPurgeAirRateWarning;

      expect(warning).toContain(`$${getMinimumPurgeAirRate(0.1).toFixed(3)}/1000 SCF`);
      expect(fixture.nativeElement.querySelector('.alert-warning')).not.toBeNull();
    });

    it('does not warn when the compressed air rate is at or above the minimum', () => {
      setForm(makeInput(DryerType.Heatless, { costOfElectricity: 0.1, costOfCompressedAir: 1 }));

      expect(component.minimumPurgeAirRateWarning).toBeNull();
      expect(fixture.nativeElement.querySelector('.alert-warning')).toBeNull();
    });

    it('does not warn for a dryer type without purge', () => {
      setForm(makeInput(DryerType.Refrigerated, { costOfElectricity: 0.1, costOfCompressedAir: 0.01 }));

      expect(component.minimumPurgeAirRateWarning).toBeNull();
    });

    it('does not warn while a rate is invalid', () => {
      const form = setForm(makeInput(DryerType.Heatless, { costOfElectricity: 0.1, costOfCompressedAir: 0.01 }));
      form.controls.costOfElectricity.setValue(null);

      expect(component.minimumPurgeAirRateWarning).toBeNull();
    });

    it('states the minimum in metric units for metric settings', () => {
      setForm(makeInput(DryerType.Heatless, { costOfElectricity: 0.1, costOfCompressedAir: 0.01 }), metric);

      expect(component.minimumPurgeAirRateWarning).toContain('/1000 m3');
    });
  });

  describe('operating hours', () => {
    it('applies the hours from the operating hours modal and recalculates', () => {
      const form = setForm(makeInput());
      component.openOperatingHoursModal();

      component.updateOperatingHours({ hoursPerYear: 5000 } as OperatingHours);

      expect(form.controls.annualOperatingHours.value).toBe(5000);
      expect(form.controls.annualOperatingHours.dirty).toBeTrue();
      expect(component.showOperatingHoursModal).toBeFalse();
      expect(calculateSpy).toHaveBeenCalledWith(true);
    });
  });
});
