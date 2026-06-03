import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { OperatingHours } from '../../../../shared/models/operations';
import { SteamLeakSurveyData } from '../../../../shared/models/standalone';
import { SteamLeakMeasurementMethod } from '../steam-leak-constants';
const HOURS_PER_YEAR = 8760;

export interface LeakMetaFormControls {
  selected: FormControl<boolean | null>;
  name: FormControl<string | null>;
  leakDescription: FormControl<string | null>;
  measurementMethod: FormControl<number | null>;
  units: FormControl<number | null>;
}

@Injectable()
export class SteamLeakSurveyFormService {
    private readonly fb = inject(FormBuilder);


    buildLeakMetaForm(leak: SteamLeakSurveyData): FormGroup<LeakMetaFormControls> {
        return this.fb.group<LeakMetaFormControls>({
            selected: new FormControl(leak.selected),
            name: new FormControl(leak.name, [Validators.required]),
            leakDescription: new FormControl(leak.leakDescription, [Validators.required]),
            measurementMethod: new FormControl(leak.measurementMethod),
            units: new FormControl(leak.units),
        });
    }

    getEmptySteamLeakData(): SteamLeakSurveyData {
        return  {
            leakDescription: 'New Leak Description',
            name: 'New Leak',
            selected: true,
            measurementMethod: SteamLeakMeasurementMethod.Estimate,
            estimateMethodData: { leakRate: 0 },
            estimateTurbineMethodData: { turbineEfficiency: 0, leakRate: 0 },
            orificeMethodData: { turbineEfficiency: 0, holeSize: 0, dischargeCoefficient: 0.61, atmosphericPressure: 14.7 },
            plumeMethodData: { turbineEfficiency: 0, plumeLength: 0, ambientTemperature: 0 },
            units: 0
        }
    }
}