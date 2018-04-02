import { Component, OnInit, Input, SimpleChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { PHAST, OperatingCosts, OperatingHours } from '../../../shared/models/phast/phast';
import { WindowRefService } from '../../../indexedDb/window-ref.service';
import { Settings } from '../../../shared/models/settings';
import { OperationsService } from './operations.service';
import { FormGroup } from '@angular/forms';
@Component({
  selector: 'app-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.css']
})
export class OperationsComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Output('savedLoss')
  savedLoss = new EventEmitter<boolean>();
  @Input()
  baselineSelected: boolean;
  @Output('fieldChange')
  fieldChange = new EventEmitter<string>();
  @Input()
  isBaseline: boolean;
  @Input()
  settings: Settings;

  operationsForm: FormGroup;
  firstChange: boolean = true;
  isCalculated: boolean;
  constructor(private operationsService: OperationsService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.phast) {
        this.initForm()
      }
    } else {
      this.firstChange = false;
    }
  }

  ngOnInit() {
    this.initForm();
  }
  initForm() {
    this.operationsForm = this.operationsService.initForm(this.phast);
    this.isCalculated = this.phast.operatingHours.isCalculated;
  }

  saveLosses() {
    let tmpOpHours: OperatingHours = {
      hoursPerShift: this.operationsForm.controls.hoursPerShift.value,
      hoursPerYear: this.operationsForm.controls.hoursPerYear.value,
      shiftsPerDay: this.operationsForm.controls.shiftsPerDay.value,
      daysPerWeek: this.operationsForm.controls.daysPerWeek.value,
      weeksPerYear: this.operationsForm.controls.weeksPerYear.value,
      isCalculated: this.isCalculated
    }
    let tmpOpCosts: OperatingCosts = {
      electricityCost: this.operationsForm.controls.electricityCost.value,
      steamCost: this.operationsForm.controls.steamCost.value,
      fuelCost: this.operationsForm.controls.fuelCost.value
    }
    let implementationCost = this.operationsForm.controls.implementationCost.value;
    this.phast.operatingCosts = tmpOpCosts;
    this.phast.operatingHours = tmpOpHours;
    this.phast.implementationCost = implementationCost;
    this.savedLoss.emit(true);
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }

}
