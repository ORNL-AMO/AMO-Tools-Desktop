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

  performanceForm: any;

  toggleCalculate: boolean = false;

  constructor(private psatService: PsatService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    if (!this.psat) {
      this.performanceForm = this.psatService.initForm();
    } else {
      this.performanceForm = this.psatService.getFormFromPsat(this.psat.inputs);
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
