import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CompressedAirDryerHelpComponent } from './compressed-air-dryer-help.component';
import { ConvertCompressedAirDryerService } from '../convert-compressed-air-dryer.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import { getMinimumPurgeAirRate } from '../compressed-air-dryer-type-config';

describe('CompressedAirDryerHelpComponent', () => {
  let component: CompressedAirDryerHelpComponent;
  let fixture: ComponentFixture<CompressedAirDryerHelpComponent>;
  let convertService: ConvertCompressedAirDryerService;
  let convertUnitsService: ConvertUnitsService;

  const imperial = { unitsOfMeasure: 'Imperial' } as Settings;
  const metric = { unitsOfMeasure: 'Metric' } as Settings;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompressedAirDryerHelpComponent],
      providers: [ConvertCompressedAirDryerService, ConvertUnitsService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    convertService = TestBed.inject(ConvertCompressedAirDryerService);
    convertUnitsService = TestBed.inject(ConvertUnitsService);
    fixture = TestBed.createComponent(CompressedAirDryerHelpComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('uses the imperial ranges and purge air multiplier for imperial settings', () => {
      fixture.componentRef.setInput('settings', imperial);
      fixture.detectChanges();

      expect(component.isMetric).toBeFalse();
      expect(component.ranges).toEqual(convertService.getValidatorRanges(imperial));
      expect(component.purgeAirRateMultiplier).toBeCloseTo(getMinimumPurgeAirRate(1), 6);
    });

    it('uses the metric ranges and purge air multiplier for metric settings', () => {
      fixture.componentRef.setInput('settings', metric);
      fixture.detectChanges();

      expect(component.isMetric).toBeTrue();
      expect(component.ranges).toEqual(convertService.getValidatorRanges(metric));
      expect(component.purgeAirRateMultiplier)
        .toBeCloseTo(convertUnitsService.convertDollarPerValue(getMinimumPurgeAirRate(1), 'ft3', 'm3'), 6);
    });

    it('falls back to imperial when no settings are passed in', () => {
      fixture.componentRef.setInput('currentField', 'flowRate');
      fixture.detectChanges();

      expect(component.isMetric).toBeFalse();
      expect(component.ranges).toEqual(convertService.getValidatorRanges(imperial));
    });
  });

  describe('template visibility', () => {
    it('shows only the help for the focused field, in the current units', () => {
      fixture.componentRef.setInput('settings', metric);
      fixture.componentRef.setInput('currentField', 'flowRate');
      fixture.detectChanges();

      const text: string = fixture.nativeElement.textContent;
      expect(text).toContain('Compressed air flow entering the dryer, in m3/min');
      expect(text).not.toContain('Operating pressure of the air entering the dryer');
    });

    it('updates the shown help when the focused field changes', () => {
      fixture.componentRef.setInput('settings', imperial);
      fixture.componentRef.setInput('currentField', 'flowRate');
      fixture.detectChanges();

      fixture.componentRef.setInput('currentField', 'pressure');
      fixture.detectChanges();

      const text: string = fixture.nativeElement.textContent;
      expect(text).toContain('Operating pressure of the air entering the dryer, in psig');
      expect(text).not.toContain('Compressed air flow entering the dryer');
    });
  });
});
