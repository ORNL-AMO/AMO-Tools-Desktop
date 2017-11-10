import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { SettingsService } from '../settings.service';
@Component({
  selector: 'app-application-settings',
  templateUrl: './application-settings.component.html',
  styleUrls: ['./application-settings.component.css']
})
export class ApplicationSettingsComponent implements OnInit {
  @Input()
  settingsForm: any;
  @Output('startSavePolling')
  startSavePolling = new EventEmitter<boolean>();
  @Input()
  inPhast: boolean;

  languages: Array<string> = [
    'English'
  ];

  currencies: Array<string> = [
    '$ - US Dollar'
  ]

  energyOptions: Array<string> = [
    'MMBtu',
    'Btu',
    'GJ',
    'kJ',
    'kcal',
    'kgce',
    'kgoe',
    'kWh'
  ]

  energyResultOptions: Array<any>;
  constructor(private convertUnitsService: ConvertUnitsService, private settingsService: SettingsService) { }

  ngOnInit() {
    //this.setUnits();
    this.energyResultOptions = new Array<any>();
    //let possibilities = this.convertUnitsService.possibilities('energy');
    this.energyOptions.forEach(val => {
      let tmpPossibility = {
        unit: val,
        display: this.getUnitName(val),
        displayUnit: this.getUnitDisplay(val)
      }
      this.energyResultOptions.push(tmpPossibility);
    })
  }

  setUnits() {
    // if (this.settingsForm.value.unitsOfMeasure == 'Imperial') {
    //   this.settingsForm.patchValue({
    //     powerMeasurement: 'hp',
    //     flowMeasurement: 'gpm',
    //     distanceMeasurement: 'ft',
    //     pressureMeasurement: 'psi'
        // currentMeasurement: 'A',
        // viscosityMeasurement: 'cST',
        // voltageMeasurement: 'V'
    //   })

    // } else if (this.settingsForm.value.unitsOfMeasure == 'Metric') {
    //   this.settingsForm.patchValue({
    //     powerMeasurement: 'kW',
    //     flowMeasurement: 'm3/h',
    //     distanceMeasurement: 'm',
    //     pressureMeasurement: 'kPa'
        // currentMeasurement: 'A',
        // viscosityMeasurement: 'cST',
        // voltageMeasurement: 'V'
      //})
    //}
    //this.setEnergyResultUnit();
    this.settingsForm = this.settingsService.setUnits(this.settingsForm);
    console.log(this.settingsForm);
    this.startSavePolling.emit(true);
  }

  // setEnergyResultUnit() {
  //   if (this.settingsForm.value.unitsOfMeasure == 'Imperial') {
  //     this.settingsForm.patchValue({
  //       energyResultUnit: 'Btu'
  //     })
  //   }
  //   else if (this.settingsForm.value.unitsOfMeasure == 'Metric') {
  //     this.settingsForm.patchValue({
  //       energyResultUnit: 'kJ'
  //     })
  //   }

  //   if (this.settingsForm.value.energySourceType == 'Electricity') {
  //     this.settingsForm.patchValue({
  //       energyResultUnit: 'kW'
  //     })
  //   }
  //}


  getUnitName(unit: any) {
    if (unit) {
      return this.convertUnitsService.getUnit(unit).unit.name.plural;
    }
  }
  getUnitDisplay(unit: any) {
    if (unit) {
      return this.convertUnitsService.getUnit(unit).unit.name.display;
    }
  }
}
