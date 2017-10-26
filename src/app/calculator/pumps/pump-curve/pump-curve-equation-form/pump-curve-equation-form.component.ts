import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, NgModel, FormsModule } from '@angular/forms';
import { PumpCurveForm, PumpCurveDataRow } from '../pump-curve';
import {PsatService} from '../../../../psat/psat.service';
import {IndexedDbService} from '../../../../indexedDb/indexed-db.service';
import {ConvertUnitsService} from '../../../../shared/convert-units/convert-units.service';
import {PSAT} from '../../../../shared/models/psat';
import {Settings} from '../../../../shared/models/settings';

@Component({
  selector: 'app-pump-curve-equation-form',
  templateUrl: './pump-curve-equation-form.component.html',
  styleUrls: ['./pump-curve-equation-form.component.css']
})
export class PumpCurveEquationFormComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Input()
  pumpCurveForm: PumpCurveForm;
  @Input()
  settings: Settings;
  @Input()
  inPsat: boolean;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  equationForm: any;
  orderOptions: Array<number> = [
    2, 3, 4, 5, 6
  ]

  // maxFlow
  constructor(private psatService: PsatService, private indexedDbService: IndexedDbService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() { if (!this.psat) {
    this.equationForm = this.psatService.initForm();
    this.equationForm.patchValue({
       maxFlow: 0
    })
  } else {
    this.equationForm = this.psatService.getFormFromPsat(this.psat.inputs);
  }

    // get settings if standalone
    if (!this.settings) {
      this.indexedDbService.getDirectorySettings(1).then(
        results => {
          // convert defaults if standalone without default system settings
          if (results[0].flowMeasurement != 'gpm') {
            let tmpVal = this.convertUnitsService.value(this.equationForm.value.flowRate).from('gpm').to(results[0].flowMeasurement);
            this.equationForm.patchValue({
              flowRate: this.psatService.roundVal(tmpVal, 2)
            })
          }
          this.settings = results[0];
        }
      )
    }
    this.emitCalculateChanges();
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  emitCalculateChanges() {
    this.calculate.emit(true);
  }

  setOrder() {
    if (this.pumpCurveForm.headOrder < 3) {
      this.pumpCurveForm.headFlow3 = 0;
    }
    if (this.pumpCurveForm.headOrder < 4) {
      this.pumpCurveForm.headFlow4 = 0;
    }
    if (this.pumpCurveForm.headOrder < 5) {
      this.pumpCurveForm.headFlow5 = 0;
    }
    if (this.pumpCurveForm.headOrder < 6) {
      this.pumpCurveForm.headFlow6 = 0;
    }
    this.emitCalculateChanges();
  }
}
