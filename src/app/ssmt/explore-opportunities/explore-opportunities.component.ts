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

  @ViewChild('resultTabs') resultTabs: ElementRef;


  tabSelect: string = 'results';
  currentField: string;
  helpHeight: number;

  baselineSankey: SSMT;
  modificationSankey: SSMT;

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
      }
    }
    if (changes.modificationIndex) {
      this.getSankeyData();
      //this.checkToasty();
    }
  }

  ngOnDestroy(){
    //this.exploreOppsToast.emit(false);
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
    this.ssmtService.openNewModificationModal.next(true);
  }

  getResults() {

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

  // checkToasty() {
  //   if (this.modificationExists) {
  //     if (!this.ssmt.modifications[this.modificationIndex].exploreOpportunities) {
  //       this.exploreOppsToast.emit(true);
  //       let toastOptions: ToastOptions = {
  //         title: 'Explore Opportunites',
  //         msg: 'The selected modification was created using the expert view. There may be changes to the modification that are not visible from this screen.',
  //         showClose: true,
  //         timeout: 10000000,
  //         theme: 'default'
  //       }
  //       this.toastyService.warning(toastOptions);
  //     } else {
  //       this.exploreOppsToast.emit(false);
  //     }
  //   }
  // }
}
