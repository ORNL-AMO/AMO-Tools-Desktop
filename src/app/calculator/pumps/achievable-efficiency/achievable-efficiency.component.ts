import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../../psat/psat.service';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { Settings } from '../../../shared/models/settings';
import { SettingsService } from '../../../settings/settings.service';

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

  efficiencyForm: any;
  toggleCalculate: boolean = true;
  constructor(private formBuilder: FormBuilder, private psatService: PsatService, private indexedDbService: IndexedDbService, private settingsService: SettingsService) { }

  ngOnInit() {
    if (!this.psat) {
      this.efficiencyForm = this.psatService.initForm();
    } else {
      this.efficiencyForm = this.psatService.getFormFromPsat(this.psat.inputs);
    }
    if (!this.settings) {
      this.indexedDbService.getDirectorySettings(1).then(
        results => {
          if (results.length != 0) {
            this.settings = results[0];
          }
        }
      )
    }
  }

  calculate() {
    this.toggleCalculate = !this.toggleCalculate;
  }

}
