import { Component, OnInit, Input, EventEmitter, Output, ElementRef, ViewChild, SimpleChanges, HostListener } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { FsatService } from '../fsat.service';
import { FSAT } from '../../shared/models/fans';
import { SnackbarMessage, SnackbarService } from '../../shared/snackbar-notification/snackbar.service';

@Component({
    selector: 'app-explore-opportunities',
    templateUrl: './explore-opportunities.component.html',
    styleUrls: ['./explore-opportunities.component.css'],
    standalone: false
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
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  tabSelect: string = 'results';
  currentField: string;
  helpHeight: number;

  baselineSankey: FSAT;
  modificationSankey: FSAT;
  sankeyView: string = 'Baseline';
  smallScreenTab: string = 'form';

  toastData: { title: string, body: string, setTimeoutVal: number } = { title: '', body: '', setTimeoutVal: undefined };
  showToast: boolean = false;
  constructor(private fsatService: FsatService, private snackbarService: SnackbarService) {
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
      this.notifyExpertView();
    }
    if (changes.fsat) {
      this.getSankeyData();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
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
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.helpHeight = this.containerHeight - tabHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }

  resizeTabs(){
    if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
      this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
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


  notifyExpertView() {
    if (this.modificationExists) {
      if (!this.fsat.modifications[this.modificationIndex].exploreOpportunities) {
        this.snackbarService.setSnackbarMessage('exploreOpportunities', 'info', 'long');
      }
    }
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}
