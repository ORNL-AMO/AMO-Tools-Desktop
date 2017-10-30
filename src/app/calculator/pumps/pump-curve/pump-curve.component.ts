import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { PsatService } from '../../../psat/psat.service';
import { PumpCurveForm, PumpCurveDataRow } from './pump-curve';
import { PumpCurveService } from './pump-curve.service';
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
  currentField: string = 'maxFlow';
  selectedFormView: string;
  regEquation: string;
  constructor(private indexedDbService: IndexedDbService, private psatService: PsatService, private convertUnitsService: ConvertUnitsService, private pumpCurveService: PumpCurveService) { }

  ngOnInit() {
    //get systen settings if using stand alone calculator
    if (!this.settings) {
      this.indexedDbService.getDirectorySettings(1).then(
        results => {
          this.settings = results[0];
        }
      )
    }

    this.initForm();
    this.pumpCurveService.calcMethod.subscribe(val => {
      this.selectedFormView = val;
    })

    this.pumpCurveService.regEquation.subscribe(val => {
      if (val) {
        this.regEquation = val;
        for (let i = 0; i < this.pumpCurveForm.dataOrder; i++) {
          this.regEquation = this.regEquation.replace(/x/, '(flow)');
          this.regEquation = this.regEquation.replace('+ -', '- ');
        }
        this.regEquation = this.regEquation.replace('y', 'Head');
        this.regEquation = this.regEquation.replace('^2', '&#x00B2;');
        this.regEquation = this.regEquation.replace('^3', '&#x00B3;');
        this.regEquation = this.regEquation.replace('^4', '&#x2074;');
        this.regEquation = this.regEquation.replace('^5', '&#x2075;');
        this.regEquation = this.regEquation.replace('^6', '&#x2076;');
      } else {
        let tmpStr = this.pumpCurveForm.headFlow2 + '(flow)&#x00B2; + ' + this.pumpCurveForm.headFlow + ('(flow) +') + this.pumpCurveForm.headConstant;
        if (this.pumpCurveForm.headOrder > 2 && this.pumpCurveForm.headFlow3) {
          tmpStr = this.pumpCurveForm.headFlow3 + '(flow)&#x00B3; + ' + tmpStr;
        }
        if (this.pumpCurveForm.headOrder > 3 && this.pumpCurveForm.headFlow4) {
          tmpStr = this.pumpCurveForm.headFlow4 + '(flow)&#x2074; + ' + tmpStr;
        }
        if (this.pumpCurveForm.headOrder > 4 && this.pumpCurveForm.headFlow5) {
          tmpStr = this.pumpCurveForm.headFlow5 + '(flow)&#x2075; + ' + tmpStr;
        }
        if (this.pumpCurveForm.headOrder > 5 && this.pumpCurveForm.headFlow6) {
          tmpStr = this.pumpCurveForm.headFlow6 + '(flow)&#x2076; + ' + tmpStr;
        }
        this.regEquation = 'Head = ' + tmpStr;
        for (let i = 0; i < this.pumpCurveForm.headOrder; i++) {
          this.regEquation = this.regEquation.replace('+ -', '- ');
        }
      }
    })
  }

  ngOnDestroy() {
    this.pumpCurveService.calcMethod.next('Equation')
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  setField(str: string) {
    this.currentField = str;
  }
  initForm() {
    this.pumpCurveForm = {
      dataRows: new Array<PumpCurveDataRow>(
        { flow: 0, head: 355 },
        { flow: 100, head: 351 },
        // { flow: 200, head: 343.6188 },
        // { flow: 300, head: 335.9542 },
        // { flow: 400, head: 324.9089 },
        // { flow: 480, head: 314.7216 },
        // { flow: 560, head: 304.5332 },
        { flow: 630, head: 294 },
        // { flow: 690, head: 284.1775 },
        // { flow: 800, head: 264.6842 },
        // { flow: 900, head: 241.8114 },
        // { flow: 970, head: 222.3425 },
        { flow: 1020, head: 202 }
      ),
      maxFlow: 1020,
      dataOrder: 3,
      baselineMeasurement: 1,
      modifiedMeasurement: 1,
      exploreLine: 0,
      exploreFlow: 0,
      exploreHead: 0,
      explorePumpEfficiency: 0,
      headOrder: 3,
      headConstant: 356.96,
      headFlow: -0.0686,
      headFlow2: 0.000005,
      headFlow3: -0.00000008,
      headFlow4: 0,
      headFlow5: 0,
      headFlow6: 0,
      pumpEfficiencyOrder: 3,
      pumpEfficiencyConstant: 0,
      measurementOption: 'Diameter'
    }
  }

  calculate() {
    if (this.pumpCurveForm.modifiedMeasurement != this.pumpCurveForm.baselineMeasurement) {
      if (this.pumpCurveForm.modifiedMeasurement != 0 && this.pumpCurveForm.baselineMeasurement != 0) {
        this.toggleCalculate = !this.toggleCalculate;
      }
    } else {
      this.toggleCalculate = !this.toggleCalculate;
    }
  }
}
