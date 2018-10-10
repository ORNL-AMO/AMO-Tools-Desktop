import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OperatingCosts } from '../../../shared/models/operations';
import { Settings } from 'electron';
import { CompareService } from '../../compare.service';
import { SsmtService } from '../../ssmt.service';

@Component({
  selector: 'app-operating-costs',
  templateUrl: './operating-costs.component.html',
  styleUrls: ['./operating-costs.component.css']
})
export class OperatingCostsComponent implements OnInit {
  @Input()
  operatingCosts: OperatingCosts;
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Input()
  selected: boolean;
  @Input()
  inSetup: boolean;
  constructor(private compareService: CompareService, private ssmtService: SsmtService) { }

  ngOnInit() {
  }

  save() {
    this.emitSave.emit(true);
  }

  canCompare() {
    if (this.compareService.baselineSSMT && this.compareService.modifiedSSMT && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }

  isFuelCostDifferent() {
    if (this.canCompare()) {
      return this.compareService.isFuelCostDifferent();
    } else {
      return false;
    }
  }

  isElectricityCostDifferent() {
    if (this.canCompare()) {
      return this.compareService.isElectricityCostDifferent();
    } else {
      return false;
    }
  }
  
  isMakeUpWaterCostsDifferent() {
    if (this.canCompare()) {
      return this.compareService.isMakeUpWaterCostsDifferent();
    } else {
      return false;
    }
  }

  focusField(str: string){
    this.ssmtService.currentField.next(str);
  }  
  focusOut() {
    this.ssmtService.currentField.next('default');
  }
}
