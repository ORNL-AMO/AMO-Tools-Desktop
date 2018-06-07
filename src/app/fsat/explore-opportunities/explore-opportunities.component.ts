import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { CompareService } from '../compare.service';
import { FsatService } from '../fsat.service';
import { FSAT } from '../../shared/models/fans';

@Component({
  selector: 'app-explore-opportunities',
  templateUrl: './explore-opportunities.component.html',
  styleUrls: ['./explore-opportunities.component.css']
})
export class ExploreOpportunitiesComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Input()
  settings: Settings;
  @Input()
  containerHeight: number;
  @Input()
  modificationIndex: number;
  @Input()
  modificationExists: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<FSAT>();

  tabSelect: string = 'results';
  currentField: string;
  constructor(private fsatService: FsatService) { }

  ngOnInit() {
  }
  setTab(str: string) {
    this.tabSelect = str;
  }

  focusField($event) {
    this.currentField = $event;
  }

  addExploreOpp(){
    this.fsatService.openNewModal.next(true);
  }

  getResults(){

  }


  save(){
    this.emitSave.emit(this.assessment.fsat);
  }
}
