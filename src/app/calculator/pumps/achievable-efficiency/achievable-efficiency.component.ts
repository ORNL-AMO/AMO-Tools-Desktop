import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../../psat/psat.service';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { Settings } from '../../../shared/models/settings';
import { SettingsService } from '../../../settings/settings.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';
@Component({
  selector: 'app-achievable-efficiency',
  templateUrl: './achievable-efficiency.component.html',
  styleUrls: ['./achievable-efficiency.component.css']
})
export class AchievableEfficiencyComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Input()
  settings: Settings;
  @Input()
  inPsat: boolean;
  
  efficiencyForm: FormGroup;
  toggleCalculate: boolean = true;
  tabSelect: string = 'results';

  constructor(private formBuilder: FormBuilder, private psatService: PsatService, private indexedDbService: IndexedDbService, private settingsService: SettingsService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (!this.psat) {
      this.efficiencyForm = this.psatService.initForm();
      //patch default/starter values for stand alone calculator
      this.efficiencyForm.patchValue({
        pumpType: this.psatService.getPumpStyleFromEnum(6),
        flowRate: 2000
      })
    } else {
      this.efficiencyForm = this.psatService.getFormFromPsat(this.psat.inputs);
    }


    //if stand alone calculator use system settings
    if (!this.settings) {
      this.indexedDbService.getDirectorySettings(1).then(
        results => {
          if (results.length != 0) {
            if (results[0].flowMeasurement != 'gpm') {
              let tmpVal = this.convertUnitsService.value(this.efficiencyForm.controls.flowRate.value).from('gpm').to(results[0].flowMeasurement);
              this.efficiencyForm.patchValue({
                flowRate: this.psatService.roundVal(tmpVal, 2)
              })
            }
            this.settings = results[0];
          }
        }
      )
    }
  }

  calculate() {
    this.toggleCalculate = !this.toggleCalculate;
  }

  setTab(str: string){
    this.tabSelect = str;
  }
}
