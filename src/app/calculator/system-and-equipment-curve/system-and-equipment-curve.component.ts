import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { SystemAndEquipmentCurveService } from './system-and-equipment-curve.service';

@Component({
  selector: 'app-system-and-equipment-curve',
  templateUrl: './system-and-equipment-curve.component.html',
  styleUrls: ['./system-and-equipment-curve.component.css']
})
export class SystemAndEquipmentCurveComponent implements OnInit {
  @Input()
  equipmentType: string;
  @Input()
  assessment: Assessment;
  @Input()
  isEquipmentCurvePrimary: boolean;
  @Input()
  settings: Settings;

  calculatorTitle: string;
  tabSelect: string = 'results';
  constructor(private settingsDbService: SettingsDbService, private systemAndEquipmentCurveService: SystemAndEquipmentCurveService) { }

  ngOnInit() {
    this.setCalculatorTitle();
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  setCalculatorTitle() {
    if (this.equipmentType == 'fan') {
      if (this.isEquipmentCurvePrimary == true) {
        this.calculatorTitle = 'Fan Curve'
        this.systemAndEquipmentCurveService.focusedCalculator.next('fan-curve');
        this.systemAndEquipmentCurveService.equipmentCurveCollapsed.next('open');
        this.systemAndEquipmentCurveService.systemCurveCollapsed.next('closed');
      } else {
        this.calculatorTitle = 'Fan System Curve';
        this.systemAndEquipmentCurveService.focusedCalculator.next('fan-system-curve');
        this.systemAndEquipmentCurveService.equipmentCurveCollapsed.next('closed');
        this.systemAndEquipmentCurveService.systemCurveCollapsed.next('open');
      }
    } else {
      if (this.isEquipmentCurvePrimary == true) {
        this.calculatorTitle = 'Pump Curve'
        this.systemAndEquipmentCurveService.focusedCalculator.next('pump-curve');
        this.systemAndEquipmentCurveService.equipmentCurveCollapsed.next('open');
        this.systemAndEquipmentCurveService.systemCurveCollapsed.next('closed');
      } else {
        this.calculatorTitle = 'Pump System Curve';
        this.systemAndEquipmentCurveService.focusedCalculator.next('pump-system-curve');
        this.systemAndEquipmentCurveService.equipmentCurveCollapsed.next('closed');
        this.systemAndEquipmentCurveService.systemCurveCollapsed.next('open');
      }
    }
  }

  btnGenerateExample() {

  }

  btnResetDefaults() {

  }

}
