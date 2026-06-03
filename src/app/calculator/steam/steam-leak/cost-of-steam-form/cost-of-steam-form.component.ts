import {
  Component, ChangeDetectionStrategy, OnInit, AfterViewInit,
  ViewChild, ElementRef, inject, computed, input,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { FacilitySteamLeakData } from '../../../../shared/models/standalone';
import { OperatingHours } from '../../../../shared/models/operations';
import { SteamLeakSurveyService } from '../steam-leak-survey-service';

export interface FacilitySteamFormControls {
  annualOperatingHours: FormControl<number | null>;
  utilityType: FormControl<number | null>;
  steamCost: FormControl<number | null>;
  steamTemperature: FormControl<number | null>;
  steamPressure: FormControl<number | null>;
  feedwaterTemperature: FormControl<number | null>;
  fuelCost: FormControl<number | null>;
  fuelEnergyFactor: FormControl<number | null>;
  electricityCost: FormControl<number | null>;
  boilerEfficiency: FormControl<number | null>;
  systemEfficiency: FormControl<number | null>;
}

@Component({
  selector: 'app-cost-of-steam-form',
  templateUrl: './cost-of-steam-form.component.html',
  styleUrls: ['./cost-of-steam-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:resize)': 'onResize()' },
  standalone: false,
})
export class CostOfSteamFormComponent implements OnInit, AfterViewInit {
  readonly settings = input.required<Settings>();

  protected readonly surveyService = inject(SteamLeakSurveyService);
  private readonly fb = inject(FormBuilder);

  facilityForm!: FormGroup<FacilitySteamFormControls>;
  showOperatingHoursModal = false;
  formWidth = 0;

  @ViewChild('formElement') formElement!: ElementRef;

  readonly utilityTypeOptions: Array<{ display: string; value: number }> = [
    { display: 'Steam', value: 0 },
    { display: 'Electric', value: 1 },
    { display: 'Natural Gas', value: 2 },
  ];

  private readonly facilityData = computed(() => this.surveyService.steamLeakInput()?.facilitySteamLeakData);

  ngOnInit(): void {
    const input = this.surveyService.steamLeakInput();
    if (input) {
      this.facilityForm = this.buildFacilitySteamForm(input.facilitySteamLeakData);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.setOpHoursModalWidth(), 100);
  }

  onResize(): void {
    this.setOpHoursModalWidth();
  }

  save(): void {
    const current = this.surveyService.steamLeakInput();
    if (!current) return;
    this.surveyService.steamLeakInput.set({ ...current, facilitySteamLeakData: this.facilityForm.getRawValue() as FacilitySteamLeakData });
  }

  changeField(field: string): void {
    this.surveyService.currentField.set(field);
  }

  changeUtilityType(): void {
    this.save();
  }

  openOperatingHoursModal(): void {
    this.showOperatingHoursModal = true;
  }

  closeOperatingHoursModal(): void {
    this.showOperatingHoursModal = false;
  }

  updateOperatingHours(oppHours: OperatingHours): void {
    this.facilityForm.controls.annualOperatingHours.patchValue(oppHours.hoursPerYear);
    this.save();
    this.closeOperatingHoursModal();
  }

  get allSelected(): boolean {
    const leaks = this.surveyService.output().individualLeaks;
    return leaks.length > 0 && leaks.every(l => l.selected);
  }

  private buildFacilitySteamForm(data: FacilitySteamLeakData): FormGroup<FacilitySteamFormControls> {
    return this.fb.group<FacilitySteamFormControls>({
      annualOperatingHours: new FormControl(data.annualOperatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]),
      utilityType: new FormControl(data.utilityType),
      steamCost: new FormControl(data.steamCost, [Validators.min(0)]),
      steamTemperature: new FormControl(data.steamTemperature, [Validators.required, Validators.min(0)]),
      steamPressure: new FormControl(data.steamPressure, [Validators.required, Validators.min(0)]),
      feedwaterTemperature: new FormControl(data.feedwaterTemperature, [Validators.required, Validators.min(0)]),
      fuelCost: new FormControl(data.fuelCost, [Validators.min(0)]),
      fuelEnergyFactor: new FormControl(data.fuelEnergyFactor, [Validators.min(0)]),
      electricityCost: new FormControl(data.electricityCost, [Validators.min(0)]),
      boilerEfficiency: new FormControl(data.boilerEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]),
      systemEfficiency: new FormControl(data.systemEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]),
    });
  }

  private setOpHoursModalWidth(): void {
    if (this.formElement?.nativeElement?.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
