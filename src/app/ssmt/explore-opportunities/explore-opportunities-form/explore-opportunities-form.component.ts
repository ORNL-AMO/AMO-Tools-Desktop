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
  }

  ngOnDestroy() {
    if (this.ssmt.modifications[this.exploreModIndex] && !this.ssmt.modifications[this.exploreModIndex].ssmt.name) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.name = 'Opportunities Modification';
      this.save(this.ssmt);
    }
  }

  save(newSSMT: SSMT) {
    this.ssmt = newSSMT;
    this.emitSave.emit(this.ssmt);
  }

  focusField(str: string) {
    // this.helpPanelService.currentField.next(str);
    // this.modifyConditionsService.modifyConditionsTab.next('fan-field-data')
  }

  addNewMod() {
    this.ssmtService.openNewModificationModal.next(true);
  }
}
