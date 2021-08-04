import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SSMT } from '../../shared/models/steam/ssmt';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { SsmtService } from '../ssmt.service';

@Component({
  selector: 'app-explore-opportunities',
  templateUrl: './explore-opportunities.component.html',
  styleUrls: ['./explore-opportunities.component.css']
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
  @Output('exploreOppsToast')
  exploreOppsToast = new EventEmitter<boolean>();

  @ViewChild('resultTabs', { static: false }) resultTabs: ElementRef;


  tabSelect: string = 'results';
  currentField: string;
  helpHeight: number;

  baselineSankey: SSMT;
  modificationSankey: SSMT;
  sankeyView: string = 'Baseline';

  toastData: { title: string, body: string, setTimeoutVal: number } = { title: '', body: '', setTimeoutVal: undefined };
  showToast: boolean = false;
  constructor(private ssmtService: SsmtService) {
    // this.toastyConfig.theme = 'bootstrap';
    // this.toastyConfig.position = 'bottom-right';
    // this.toastyConfig.limit = 1;
  }

  ngOnInit() {
    this.getSankeyData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.containerHeight) {
      if (!changes.containerHeight.firstChange) {
        this.getContainerHeight();
        this.checkExploreOpps();
      }
    }
    if (changes.modificationIndex) {
      this.getSankeyData();
      //this.checkToasty();
    }
    if (changes.ssmt) {
      this.getSankeyData();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getContainerHeight();
      this.checkExploreOpps();
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

  checkExploreOpps() {
    if (this.modificationExists) {
      if (!this.ssmt.modifications[this.modificationIndex].exploreOpportunities) {
        let title: string = 'Explore Opportunities';
        let body: string = 'The selected modification was created using the expert view. There may be changes to the modification that are not visible from this screen.';
        this.openToast(title, body);
        this.exploreOppsToast.emit(false);
      }else if(this.showToast){
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
