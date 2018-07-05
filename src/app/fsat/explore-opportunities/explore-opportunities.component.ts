import { Component, OnInit, Input, EventEmitter, Output, ElementRef, ViewChild, SimpleChanges } from '@angular/core';
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
  fsat: FSAT;
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

  @ViewChild('resultTabs') resultTabs: ElementRef;


  tabSelect: string = 'results';
  currentField: string;
  helpHeight: number;

  baselineSankey: FSAT;
  modificationSankey: FSAT;

  constructor(private fsatService: FsatService) { }

  ngOnInit() {
    this.getSankeyData();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getContainerHeight();
    }, 100);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  focusField($event) {
    this.currentField = $event;
  }

  addExploreOpp() {
    this.fsatService.openNewModal.next(true);
  }

  getResults() {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.containerHeight) {
      if (!changes.containerHeight.firstChange) {
        this.getContainerHeight();
      }
    }
    if (changes.modificationIndex) {
      this.getSankeyData();
    }
  }

  save() {
    this.emitSave.emit(this.assessment.fsat);
  }

  getContainerHeight() {
    if (this.containerHeight && this.resultTabs) {
      let tabHeight = this.resultTabs.nativeElement.clientHeight;
      this.helpHeight = this.containerHeight - tabHeight;
    }
  }



  getSankeyData() {
    this.baselineSankey = this.fsat;
    if (this.modificationExists) {
      this.modificationSankey = this.fsat.modifications[this.modificationIndex].fsat;
    }
  }
}
