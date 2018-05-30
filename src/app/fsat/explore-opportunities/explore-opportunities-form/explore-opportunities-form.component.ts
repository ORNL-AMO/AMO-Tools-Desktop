import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { FSAT } from '../../../shared/models/fans';
import { HelpPanelService } from '../../help-panel/help-panel.service';
import { ModifyConditionsService } from '../../modify-conditions/modify-conditions.service';

@Component({
  selector: 'app-explore-opportunities-form',
  templateUrl: './explore-opportunities-form.component.html',
  styleUrls: ['./explore-opportunities-form.component.css']
})
export class ExploreOpportunitiesFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  fsat:FSAT;
  @Input()
  exploreModIndex: number;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();

  showSizeMargin: boolean;
  constructor(private helpPanelService: HelpPanelService, private modifyConditionsService: ModifyConditionsService) { }

  ngOnInit() {
    this.checkOptimized();
  }
  

  calculate() {
    this.save();
    this.emitCalculate.emit(true);
  }

  save() {
    this.emitSave.emit(true);
  }

  toggleOptimized() {
    if (!this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.optimize) {
      // this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.fixedSpeed = 0;
      this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.sizeMargin = 0;
      this.showSizeMargin = false;
    }
    this.calculate();
  }

  checkOptimized() {
    if (this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.optimize) {
      if (this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.sizeMargin != 0) {
        this.showSizeMargin = true;
      }
    }
  }

  focusField(str: string){
    this.helpPanelService.currentField.next(str);
    this.modifyConditionsService.modifyConditionsTab.next('fan-field-data')
  }
}
