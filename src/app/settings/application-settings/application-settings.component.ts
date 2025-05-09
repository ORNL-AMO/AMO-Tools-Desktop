import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { SettingsService } from '../settings.service';
import { UntypedFormGroup } from '@angular/forms';
import { CoreService } from '../../core/core.service';
declare var google: any;

@Component({
    selector: 'app-application-settings',
    templateUrl: './application-settings.component.html',
    styleUrls: ['./application-settings.component.css'],
    standalone: false
})
export class ApplicationSettingsComponent implements OnInit {
  @Input()
  settingsForm: UntypedFormGroup;
  @Output('startSavePolling')
  startSavePolling = new EventEmitter<boolean>();
  @Input()
  inPsat: boolean;
  @Input()
  generalSettings: boolean;
  @Input()
  inPhast: boolean;
  @Input()
  inTreasureHunt: boolean;
  @Input()
  inInventory: boolean;

  languages: Array<string> = [
    'English'
  ];

  currencies: Array<string> = [
    '$',
    // '$k'
  ];

  energyOptions: Array<string> = [
    'MMBtu',
    'Btu',
    'GJ',
    'kJ',
    'kcal',
    'kgce',
    'kgoe',
    'kWh',
    'MWh'
  ];

  energyResultOptions: Array<any>;
  constructor(private convertUnitsService: ConvertUnitsService, private settingsService: SettingsService, private coreService: CoreService) { }

  ngOnInit() {
    //this.setUnits();
    this.energyResultOptions = new Array<any>();
    //let possibilities = this.convertUnitsService.possibilities('energy');
    this.energyOptions.forEach(val => {
      let tmpPossibility = {
        unit: val,
        display: this.getUnitName(val),
        displayUnit: this.getUnitDisplay(val)
      };
      this.energyResultOptions.push(tmpPossibility);
    });
  }

  setUnits() {
    this.settingsForm = this.settingsService.setUnits(this.settingsForm);
    this.startSavePolling.emit(false);
  }

  save() {
    this.startSavePolling.emit(true);
  }

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
