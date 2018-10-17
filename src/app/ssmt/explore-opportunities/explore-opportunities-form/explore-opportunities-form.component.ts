import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SSMT } from '../../../shared/models/steam/ssmt';
import { SsmtService } from '../../ssmt.service';

@Component({
  selector: 'app-explore-opportunities-form',
  templateUrl: './explore-opportunities-form.component.html',
  styleUrls: ['./explore-opportunities-form.component.css']
})
export class ExploreOpportunitiesFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  ssmt: SSMT;
  @Input()
  exploreModIndex: number;

  @Output('emitSave')
  emitSave = new EventEmitter<SSMT>();
  @Output('emitAddNewMod')
  emitAddNewMod = new EventEmitter<boolean>();

  showSizeMargin: boolean;
  constructor(private ssmtService: SsmtService) { }

  ngOnInit() {
   // this.checkOptimized();
  }
  
  save(newSSMT: SSMT) {
    this.ssmt = newSSMT;
    this.emitSave.emit(this.ssmt);
  }

  // toggleOptimized() {
  //   if (!this.ssmt.modifications[this.exploreModIndex].fsat.fanMotor.optimize) {
  //     // this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.fixedSpeed = 0;
  //     this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.sizeMargin = 0;
  //     this.showSizeMargin = false;
  //   }
  //   this.calculate();
  // }

  // checkOptimized() {
  //   if (this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.optimize) {
  //     if (this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.sizeMargin != 0) {
  //       this.showSizeMargin = true;
  //     }
  //   }
  // }

  focusField(str: string){
    // this.helpPanelService.currentField.next(str);
    // this.modifyConditionsService.modifyConditionsTab.next('fan-field-data')
  }

  addNewMod(){
    this.ssmtService.openNewModificationModal.next(true);
  }
}
