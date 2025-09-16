import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SSMT } from '../../shared/models/steam/ssmt';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { SsmtService } from '../ssmt.service';
import { SnackbarService } from '../../shared/snackbar-notification/snackbar.service';

@Component({
    selector: 'app-explore-opportunities',
    templateUrl: './explore-opportunities.component.html',
    styleUrls: ['./explore-opportunities.component.css'],
    standalone: false
})
export class ExploreOpportunitiesComponent implements OnInit {
  @Input()
  ssmt: SSMT;
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
  emitSave = new EventEmitter<SSMT>();
  @Output('emitAddNewMod')
  emitAddNewMod = new EventEmitter<boolean>();

  @ViewChild('resultTabs', { static: false }) resultTabs: ElementRef;


  tabSelect: string = 'results';
  currentField: string;
  helpHeight: number;

  baselineSankey: SSMT;
  modificationSankey: SSMT;
  sankeyView: string = 'Baseline';
  smallScreenTab: string = 'form';

  toastData: { title: string, body: string, setTimeoutVal: number } = { title: '', body: '', setTimeoutVal: undefined };
  showToast: boolean = false;
  constructor(private ssmtService: SsmtService, private snackbarService: SnackbarService) {
  }

  ngOnInit() {
    this.getSankeyData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.containerHeight) {
      if (!changes.containerHeight.firstChange) {
        this.getContainerHeight();
        this.notifyExploreOpps();
      }
    }
    if (changes.modificationIndex) {
      this.getSankeyData();
    }
    if (changes.ssmt) {
      this.getSankeyData();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getContainerHeight();
      this.notifyExploreOpps();
    }, 100);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  focusField($event) {
    this.currentField = $event;
  }

  addExploreOpp() {
    this.ssmtService.openNewModificationModal.next(true);
  }

  save(newSSMT: SSMT) {
    this.assessment.ssmt = newSSMT;
    this.emitSave.emit(this.assessment.ssmt);
  }

  getContainerHeight() {
    if (this.containerHeight && this.resultTabs) {
      let tabHeight = this.resultTabs.nativeElement.clientHeight;
      this.helpHeight = this.containerHeight - tabHeight;
    }
  }

  getSankeyData() {
    this.baselineSankey = this.ssmt;
    if (this.modificationExists) {
      this.modificationSankey = this.ssmt.modifications[this.modificationIndex].ssmt;
    }
  }

  notifyExploreOpps() {
    if (this.modificationExists) {
      if (!this.ssmt.modifications[this.modificationIndex].exploreOpportunities) {
        this.snackbarService.setSnackbarMessage('exploreOpportunities', 'info', 'long');
      }
    }
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}
