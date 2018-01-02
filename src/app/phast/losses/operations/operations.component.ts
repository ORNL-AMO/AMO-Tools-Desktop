import { Component, OnInit, Input, SimpleChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { PHAST, OperatingCosts, OperatingHours } from '../../../shared/models/phast/phast';
import { WindowRefService } from '../../../indexedDb/window-ref.service';
import { Settings } from '../../../shared/models/settings';
import { OperationsService } from './operations.service';
import { OperationsCompareService } from './operations-compare.service';
@Component({
  selector: 'app-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.css']
})
export class OperationsComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  saveClicked: boolean;
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

  operationsForm: any;
  firstChange: boolean = true;
  isCalculated: boolean;
  constructor(private operationsService: OperationsService, private operationsCompareService: OperationsCompareService) { }

  ngOnInit() {
    this.operationsForm = this.operationsService.initForm(this.phast);
    this.isCalculated = this.phast.operatingHours.isCalculated;
    this.setCompareVals();
    this.operationsCompareService.initCompareObjects();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.saveClicked) {
        this.saveLosses();
      }
    }
    else {
      this.firstChange = false;
    }
  }

  ngOnDestroy() {
    if (this.isBaseline) {
      this.operationsCompareService.baseline = null;
    } else {
      this.operationsCompareService.modification = null;
    }
  }

  saveLosses() {
    if (this.operationsForm.status == 'VALID') {
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
    this.setCompareVals();
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }

  setCompareVals() {
    if (this.isBaseline) {
      this.operationsCompareService.baseline = this.phast;
    } else {
      this.operationsCompareService.modification = this.phast;
    }
    if (this.operationsCompareService.differentObject && !this.isBaseline) {
      this.operationsCompareService.checkDifferent();
    }

  }

}
