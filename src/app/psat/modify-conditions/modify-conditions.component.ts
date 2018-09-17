import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { PSAT } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';
import { AssessmentService } from '../../assessment/assessment.service';
import { Assessment } from '../../shared/models/assessment';
import { CompareService } from '../compare.service';
import { Subscription } from 'rxjs';
import { PsatTabService } from '../psat-tab.service';

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
  constructor(private assessmentService: AssessmentService, private compareService: CompareService, private psatTabService: PsatTabService) { }

  ngOnInit() {
    let tmpTab = this.assessmentService.getSubTab();
    if (tmpTab) {
      this.psatTabService.modifyConditionsTab.next(tmpTab);
    }

    this.modifyConditionsSub = this.psatTabService.modifyConditionsTab.subscribe(val => {
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
