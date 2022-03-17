import { Component, OnInit, Input, EventEmitter, Output, ElementRef, ViewChild, SimpleChanges } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
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
  @Output('emitAddNewMod')
  emitAddNewMod = new EventEmitter<boolean>();

  @ViewChild('resultTabs', { static: false }) resultTabs: ElementRef;

  tabSelect: string = 'results';
  currentField: string;
  helpHeight: number;

  baselineSankey: FSAT;
  modificationSankey: FSAT;
  sankeyView: string = 'Baseline';

  toastData: { title: string, body: string, setTimeoutVal: number } = { title: '', body: '', setTimeoutVal: undefined };
  showToast: boolean = false;
  constructor(private fsatService: FsatService) {
  }

  ngOnInit() {
    this.getSankeyData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.containerHeight) {
      if (!changes.containerHeight.firstChange) {
        this.getContainerHeight();
      }
    }
    if (changes.modificationIndex) {
      this.getSankeyData();
      this.checkToasty();
    }
    if (changes.fsat) {
      this.getSankeyData();
    }
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

  addNewMod() {
    this.emitAddNewMod.emit(true);
  }


  checkToasty() {
    if (this.modificationExists) {
      if (!this.fsat.modifications[this.modificationIndex].exploreOpportunities) {
        let title: string = 'Explore Opportunities';
        let body: string = 'The selected modification was created using the expert view. There may be changes to the modification that are not visible from this screen.';
        this.openToast(title, body);
      } else if (this.showToast) {
        this.hideToast();
      }
    }
  }

  openToast(title: string, body: string) {
    this.toastData.title = title;
    this.toastData.body = body;
    this.showToast = true;
  }

  hideToast() {
    this.showToast = false;
    this.toastData = {
      title: '',
      body: '',
      setTimeoutVal: undefined
    }
  }
}
