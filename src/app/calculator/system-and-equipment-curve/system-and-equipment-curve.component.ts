import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { SettingsDbService } from '../../indexedDb/settings-db.service';

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
  constructor(private settingsDbService: SettingsDbService) { }

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
      } else {
        this.calculatorTitle = 'Fan System Curve';
      }
    } else {
      if (this.isEquipmentCurvePrimary == true) {
        this.calculatorTitle = 'Pump Curve'
      } else {
        this.calculatorTitle = 'Pump System Curve';
      }
    }
  }

}
