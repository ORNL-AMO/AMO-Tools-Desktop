import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { PSAT, PsatInputs, Modification, PsatOutputs } from '../../shared/models/psat';
import * as _ from 'lodash';
import { PsatService } from '../psat.service';
import { Settings } from '../../shared/models/settings';
import { AssessmentService } from '../../assessment/assessment.service';
import { Assessment } from '../../shared/models/assessment';
import { CompareService } from '../compare.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modify-conditions',
  templateUrl: './modify-conditions.component.html',
  styleUrls: ['./modify-conditions.component.css']
})
export class ModifyConditionsComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Input()
  settings: Settings;
  @Output('saved')
  saved = new EventEmitter<boolean>();
  @Input()
  assessment: Assessment;
  @Input()
  modificationIndex: number;
  @Input()
  modificationExists: boolean;
  @Input()
  containerHeight: number;
  // @Input()
  // emitPrint: boolean;

  modifyTab: string;
  //_modifications: Array<Modification>;
  baselineSelected: boolean = false;
  modifiedSelected: boolean = true;
  isFirstChange: boolean = true;
  showNotes: boolean = false;
  isModalOpen: boolean = false;
  modifyConditionsSub: Subscription;
  constructor(private psatService: PsatService, private assessmentService: AssessmentService, private compareService: CompareService) { }

  ngOnInit() {
    let tmpTab = this.assessmentService.getSubTab();
    if (tmpTab) {
      this.psatService.modifyConditionsTab.next(tmpTab);
    }

    this.modifyConditionsSub = this.psatService.modifyConditionsTab.subscribe(val => {
      this.modifyTab = val;
    })
  }

  ngOnDestroy(){
    this.modifyConditionsSub.unsubscribe();
  }

  save() {
    // this.psat.modifications = (JSON.parse(JSON.stringify(this._modifications)));
    this.saved.emit(true);
  }

  togglePanel(bool: boolean) {
    if (bool == this.baselineSelected) {
      this.baselineSelected = true;
      this.modifiedSelected = false;
    }
    else if (bool == this.modifiedSelected) {
      this.modifiedSelected = true;
      this.baselineSelected = false;
    }
  }

  modalOpen() {
    this.isModalOpen = true;
  }
  modalClose() {
    this.isModalOpen = false;
  }

  addModification() {
    this.compareService.openNewModal.next(true);
  }
}
