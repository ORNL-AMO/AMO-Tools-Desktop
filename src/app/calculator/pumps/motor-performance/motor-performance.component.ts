import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../../psat/psat.service';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-motor-performance',
  templateUrl: './motor-performance.component.html',
  styleUrls: ['./motor-performance.component.css']
})
export class MotorPerformanceComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Input()
  settings: Settings;
  @Input()
  inPsat: boolean;
  
  performanceForm: any;

  toggleCalculate: boolean = false;
  tabSelect: string = 'results';
  constructor(private psatService: PsatService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    if (!this.psat) {
      this.performanceForm = this.psatService.initForm();
      //default values for standalone calculator
      this.performanceForm.patchValue({
        frequency: this.psatService.getLineFreqFromEnum(0),
        horsePower: '200',
        motorRPM: 1780,
        efficiencyClass: this.psatService.getEfficiencyClassFromEnum(1),
        motorVoltage: 460,
        fullLoadAmps: 225.4,
        sizeMargin: 1
      });
    } else {
      this.performanceForm = this.psatService.getFormFromPsat(this.psat.inputs);
    }

    //use system settings for standalone calculator
    if (!this.settings) {
      this.indexedDbService.getDirectorySettings(1).then(
        results => {
          if (results.length != 0) {
            if(results[0].powerMeasurement != 'hp'){
              this.performanceForm.patchValue({
                horsePower: '150'
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
