import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { PsatService } from '../../../psat/psat.service';
import { PumpCurveForm, PumpCurveDataRow } from './pump-curve';
@Component({
  selector: 'app-pump-curve',
  templateUrl: './pump-curve.component.html',
  styleUrls: ['./pump-curve.component.css']
})
export class PumpCurveComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Input()
  settings: Settings;
  @Input()
  inPsat: boolean;

  tabSelect: string = 'results';

  pumpCurveForm: PumpCurveForm;
  toggleCalculate: boolean = false;
  constructor(private indexedDbService: IndexedDbService, private psatService: PsatService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    //get systen settings if using stand alone calculator
    if (!this.settings) {
      this.indexedDbService.getDirectorySettings(1).then(
        results => {
          this.settings = results[0];
        }
      )
    }

    if (!this.inPsat) {
      this.initForm();
    }
  }
  setTab(str: string) {
    this.tabSelect = str;
  }

  initForm() {
    this.pumpCurveForm = {
      dataRows: new Array<PumpCurveDataRow>({head: 0, flow: 0, pumpEfficiency: 0}),
      dataPumpEfficiencyOrder: 3,
      dataHeadFlowOrder: 3,
      baselineMeasurement: 0,
      modifiedMeasurement: 0,
      exploreLine: 0,
      exploreFlow: 0,
      exploreHead: 0,
      explorePumpEfficiency: 0,
      headOrder: 3,
      headConstant: 0,
      headFlow: 0,
      headFlow2: 0,
      headFlow3: 0,
      headFlow4: 0,
      headFlow5: 0,
      headFlow6: 0,
      pumpEfficiencyOrder: 3,
      pumpEfficiencyConstant: 0,
      measurementOption: 'Diameter'
    }
  }

  calculate(){
    this.toggleCalculate = !this.toggleCalculate;
  }
}
