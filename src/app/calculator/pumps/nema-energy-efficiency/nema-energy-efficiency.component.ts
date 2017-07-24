import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../../psat/psat.service';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { Settings } from '../../../shared/models/settings';


@Component({
  selector: 'app-nema-energy-efficiency',
  templateUrl: './nema-energy-efficiency.component.html',
  styleUrls: ['./nema-energy-efficiency.component.css']
})
export class NemaEnergyEfficiencyComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Input()
  settings: Settings;
  @Input()
  inPsat: boolean;

  nemaForm: any;
  tabSelect: string = 'results';
  constructor(private psatService: PsatService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    if (!this.psat) {
      this.nemaForm = this.psatService.initForm();
      this.nemaForm.patchValue({
        frequency: '50 Hz',
        horsePower: '200',
        efficiencyClass: 'Standard Efficiency',
        motorRPM: 1200
      })
    } else {
      this.nemaForm = this.psatService.getFormFromPsat(this.psat.inputs);
    }
    if (!this.settings) {
      this.indexedDbService.getDirectorySettings(1).then(
        results => {
          if (results.length != 0) {
            this.settings = results[0];
            if (this.settings.powerMeasurement != 'hp') {
              this.nemaForm.patchValue({
                horsePower: 150
              })
            }
          }
        }
      )
    }
  }
  setTab(str: string) {
    this.tabSelect = str;
  }
}
