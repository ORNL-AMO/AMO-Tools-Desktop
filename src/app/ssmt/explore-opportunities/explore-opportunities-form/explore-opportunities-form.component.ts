import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SSMT } from '../../../shared/models/steam/ssmt';
import { SsmtService } from '../../ssmt.service';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

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
  modifyOperatingCostsForm: UntypedFormGroup;
  constructor(private ssmtService: SsmtService, private formBuilder: UntypedFormBuilder) { }

  ngOnInit() {
    this.initForms();
  }

  initForms() {
    this.modifyOperatingCostsForm = this.formBuilder.group({
      implementationCosts: [this.ssmt.modifications[this.exploreModIndex].ssmt.operatingCosts.implementationCosts],
    });
  }

  ngOnDestroy() {
    if (this.ssmt.modifications[this.exploreModIndex] && !this.ssmt.modifications[this.exploreModIndex].ssmt.name) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.name = 'Opportunities Modification';
      this.save(this.ssmt);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.initForms();
      }
    }
  }

  save(newSSMT?: SSMT) {
    if(newSSMT){
      this.ssmt = newSSMT;
    }
    this.ssmt.modifications[this.exploreModIndex].ssmt.operatingCosts.implementationCosts = this.modifyOperatingCostsForm.controls.implementationCosts.value;    
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
