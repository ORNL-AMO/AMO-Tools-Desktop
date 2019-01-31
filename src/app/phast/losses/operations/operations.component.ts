import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { PHAST } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { OperationsService } from './operations.service';
import { FormGroup } from '@angular/forms';
import { OperatingHours, OperatingCosts } from '../../../shared/models/operations';
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
  @Input()
  modificationIndex: number;

  operationsForm: FormGroup;
  isCalculated: boolean;
  isFirstChange: boolean = true;
  constructor(private operationsService: OperationsService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.isFirstChange) {
      if (changes.modificationIndex) {
        this.initForm();
      }
      else {
        this.isFirstChange = false;
      }
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
    let tmpData: { costs: OperatingCosts, hours: OperatingHours } = this.operationsService.getOperatingDataFromForm(this.operationsForm);
    tmpData.hours.isCalculated = this.isCalculated;
    this.phast.operatingCosts = tmpData.costs;
    this.phast.operatingHours = tmpData.hours;
    this.phast.implementationCost = this.operationsForm.controls.implementationCost.value;
    this.savedLoss.emit(true);
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }

}
