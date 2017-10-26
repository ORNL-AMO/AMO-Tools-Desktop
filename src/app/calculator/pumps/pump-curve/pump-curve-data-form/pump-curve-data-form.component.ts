import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PumpCurveForm, PumpCurveDataRow } from '../pump-curve';
import {PSAT} from '../../../../shared/models/psat';
import * as regression from 'regression';
import {PsatService} from '../../../../psat/psat.service';
import {IndexedDbService} from '../../../../indexedDb/indexed-db.service';
import {ConvertUnitsService} from '../../../../shared/convert-units/convert-units.service';
import {Settings} from '../../../../shared/models/settings';
@Component({
  selector: 'app-pump-curve-data-form',
  templateUrl: './pump-curve-data-form.component.html',
  styleUrls: ['./pump-curve-data-form.component.css']
})
export class PumpCurveDataFormComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Input()
  pumpCurveForm: PumpCurveForm;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Input()
  inPsat: boolean;
  dataForm: any;
  orderOptions: Array<number> = [
    2, 3, 4, 5, 6
  ]
  //regEquation: string = null;
  //rSq: string = null;
  constructor(private psatService: PsatService, private indexedDbService: IndexedDbService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (!this.psat) {
    this.dataForm = this.psatService.initForm();
    this.dataForm.patchValue({
      flow: 0,
      head: 0,
    })
    } else {
    this.dataForm = this.psatService.getFormFromPsat(this.psat.inputs);
    }
    if (!this.settings) {
      this.indexedDbService.getDirectorySettings(1).then(
        results => {
          // convert defaults if standalone without default system settings
          if (results[0].flowMeasurement != 'gpm') {
            let tmpVal = this.convertUnitsService.value(this.dataForm.value.flowRate).from('gpm').to(results[0].flowMeasurement);
            this.dataForm.patchValue({
              flowRate: this.psatService.roundVal(tmpVal, 2)
            })
          }
          if (results[0].distanceMeasurement != 'ft') {
            let tmpVal = this.convertUnitsService.value(this.dataForm.value.head).from('ft').to(results[0].distanceMeasurement);

            this.dataForm.patchValue({
              head: this.psatService.roundVal(tmpVal, 2)
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

  removeRow(num: number) {
    this.pumpCurveForm.dataRows.splice(num, 1);
    this.emitCalculateChanges();
  }

  emitCalculateChanges() {
    this.calculate.emit(true);
  }
}
