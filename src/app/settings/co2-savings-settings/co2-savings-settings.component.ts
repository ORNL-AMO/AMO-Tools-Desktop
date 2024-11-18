import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Co2SavingsData } from '../../calculator/utilities/co2-savings/co2-savings.service';
import { AssessmentCo2SavingsService } from '../../shared/assessment-co2-savings/assessment-co2-savings.service';

@Component({
  selector: 'app-co2-savings-settings',
  templateUrl: './co2-savings-settings.component.html',
  styleUrls: ['./co2-savings-settings.component.css']
})
export class Co2SavingsSettingsComponent implements OnInit {
  @Input()
  settingsForm: UntypedFormGroup;
  @Output('startSavePolling')
  startSavePolling = new EventEmitter<boolean>();

  co2SavingsData: Co2SavingsData;

  constructor(private assessmentCo2SavingsService: AssessmentCo2SavingsService) { }

  ngOnInit() {
    this.co2SavingsData = this.assessmentCo2SavingsService.getCo2SavingsDataFromSettingsForm(this.settingsForm);
  }

  save() {
    this.startSavePolling.emit(true);
  }

  updateCo2SavingsSettings(co2SavingsData: Co2SavingsData) {
    this.settingsForm = this.assessmentCo2SavingsService.setCo2SavingsDataSettingsForm(co2SavingsData, this.settingsForm);
    this.save();
  }

}
