import {
  Component, ChangeDetectionStrategy, OnInit, AfterViewInit,
  ViewChild, ElementRef, inject, computed, input,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { FacilitySteamLeakData } from '../../../../shared/models/standalone';
import { OperatingHours } from '../../../../shared/models/operations';
import { SteamLeakSurveyService } from '../steam-leak-survey-service';
import { FacilitySteamLeakFormControls, SteamLeakSurveyFormService } from '../steam-leak-survey-form/steam-leak-survey-form.service';
import { SteamLeakUtilityType } from '../steam-leak-constants';

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
  private readonly formService = inject(SteamLeakSurveyFormService);

  facilityForm!: FormGroup<FacilitySteamLeakFormControls>;
  showOperatingHoursModal = false;
  formWidth = 0;

  @ViewChild('formElement') formElement!: ElementRef;

  protected readonly SteamLeakUtilityType = SteamLeakUtilityType;

  readonly utilityTypeOptions: Array<{ display: string; value: number }> = [
    { display: 'Steam', value: SteamLeakUtilityType.Steam },
    { display: 'Electric', value: SteamLeakUtilityType.Electric },
    { display: 'Natural Gas', value: SteamLeakUtilityType.NaturalGas },
    { display: 'Other Fuel', value: SteamLeakUtilityType.OtherFuel },
  ];

  private readonly facilityData = computed(() => this.surveyService.steamLeakInput()?.facilitySteamLeakData);

  ngOnInit(): void {
    const input = this.surveyService.steamLeakInput();
    if (input) {
      this.facilityForm = this.formService.buildFacilitySteamLeakForm(input.facilitySteamLeakData);
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
    if (!current || !this.facilityForm.valid) return;
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

  private setOpHoursModalWidth(): void {
    if (this.formElement?.nativeElement?.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
