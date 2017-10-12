import { Component, OnInit, Input, SimpleChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { PHAST, OperatingCosts, OperatingHours } from '../../../shared/models/phast/phast';
import { WindowRefService } from '../../../indexedDb/window-ref.service';
import { Settings } from '../../../shared/models/settings';
import { OperationsService } from './operations.service';
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
  constructor(private operationsService: OperationsService) { }

  ngOnInit() {
    this.operationsForm = this.operationsService.initForm(this.phast);
    this.isCalculated = this.phast.operatingHours.isCalculated;
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
  saveLosses() {
    if (this.operationsForm.status == 'VALID') {
      let tmpOpHours: OperatingHours = {
        hoursPerShift: this.operationsForm.value.hoursPerShift,
        hoursPerYear: this.operationsForm.value.hoursPerYear,
        shiftsPerDay: this.operationsForm.value.shiftsPerDay,
        daysPerWeek: this.operationsForm.value.daysPerWeek,
        weeksPerYear: this.operationsForm.value.weeksPerYear,
        isCalculated: this.isCalculated
      }
      let tmpOpCosts: OperatingCosts = {
        electricityCost: this.operationsForm.value.electricityCost,
        steamCost: this.operationsForm.value.steamCost,
        fuelCost: this.operationsForm.value.fuelCost
      }
      let implementationCost = this.operationsForm.value.implementationCost;
      this.phast.operatingCosts = tmpOpCosts;
      this.phast.operatingHours = tmpOpHours;
      this.phast.implementationCost = implementationCost;
      this.savedLoss.emit(true);
    }
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }

}
