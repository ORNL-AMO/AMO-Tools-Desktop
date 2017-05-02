import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../../psat/psat.service';
import { Settings } from '../../../shared/models/settings';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';

@Component({
  selector: 'app-specific-speed',
  templateUrl: './specific-speed.component.html',
  styleUrls: ['./specific-speed.component.css']
})
export class SpecificSpeedComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Input()
  settings: Settings;

  speedForm: any;
  specificSpeed: number;
  efficiencyCorrection: number;
  toggleCalculate: boolean = true;
  constructor(private psatService: PsatService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    if (!this.psat) {
      this.speedForm = this.psatService.initForm();
    } else {
      this.speedForm = this.psatService.getFormFromPsat(this.psat.inputs);
    }

    if (!this.settings) {
      this.indexedDbService.getDirectorySettings(1).then(
        results => {
          this.settings = results[0];
        }
      )
    }
  }

  calculate() {
    this.toggleCalculate = !this.toggleCalculate;
  }

}
