import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-application-settings',
  templateUrl: './application-settings.component.html',
  styleUrls: ['./application-settings.component.css']
})
export class ApplicationSettingsComponent implements OnInit {
  @Input()
  settingsForm: any;

  languages: Array<string> = [
    'English'
  ];

  currencies: Array<string> = [
    '$ - US Dollar'
  ]

  constructor() { }

  ngOnInit() {
    this.setUnits();
  }

  setUnits() {
    if (this.settingsForm.value.unitsOfMeasure == 'Imperial') {
      this.settingsForm.patchValue({
        powerMeasurement: 'hp',
        flowMeasurement: 'gpm',
        distanceMeasurement: 'ft',
        pressureMeasurement: 'psi',
        currentMeasurement: 'A',
        viscosityMeasurement: 'cST',
        voltageMeasurement: 'V'
      })

    } else if (this.settingsForm.value.unitsOfMeasure == 'Metric') {
      this.settingsForm.patchValue({
        powerMeasurement: 'kW',
        flowMeasurement: 'm3/h',
        distanceMeasurement: 'm',
        pressureMeasurement: 'kPa',
        currentMeasurement: 'A',
        viscosityMeasurement: 'cST',
        voltageMeasurement: 'V'
      })
    }
  }

}
