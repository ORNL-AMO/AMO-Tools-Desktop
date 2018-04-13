import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { PHAST } from '../../shared/models/phast/phast';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { LossTab } from '../tabs';
import { PhastCompareService } from '../phast-compare.service';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { LossesService } from '../losses/losses.service';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';

@Component({
  selector: 'app-explore-phast-opportunities',
  templateUrl: './explore-phast-opportunities.component.html',
  styleUrls: ['./explore-phast-opportunities.component.css']
})
export class ExplorePhastOpportunitiesComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;
  @Input()
  containerHeight: number;
  @Input()
  exploreModIndex: number;
  @Output('exploreOppsToast')
  exploreOppsToast = new EventEmitter<boolean>();
  @Output('save')
  save = new EventEmitter<boolean>();

  tabSelect: string = 'results';
  currentField: string = 'default';
  toggleCalculate: boolean = false;
  lossTab: LossTab = {
    step: 0,
    tabName: '',
    componentStr: ''
  };

  modExists: boolean = false;
  selectModificationSubscription: Subscription;
  toastId: any;
  constructor(private phastCompareService: PhastCompareService, private lossesService: LossesService, private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
  ) {
    this.toastyConfig.theme = 'bootstrap';
    this.toastyConfig.position = 'bottom-right';
  }

  ngOnInit() {
    this.checkExists();
    this.checkExploreOpps();
  }

  ngOnDestroy() {
    this.toastyService.clearAll();
    this.exploreOppsToast.emit(false);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.firstChange) {
        if (changes.exploreModIndex) {
          this.toastyService.clearAll();
          this.checkExists();
          this.checkExploreOpps();
        }
      }
    }
  }

  checkExists() {
    if (this.exploreModIndex || this.exploreModIndex == 0) {
      this.modExists = true;
    } else {
      this.modExists = false;
    }
  }

  checkExploreOpps() {
    if (this.modExists) {
      if (!this.phast.modifications[this.exploreModIndex].exploreOpportunities) {
        this.exploreOppsToast.emit(true);
        let toastOptions: ToastOptions = {
          title: 'Explore Opportunites',
          msg: 'The selected modification was created using the expert view. There may be changes to the modification that are not visible from this screen.',
          showClose: true,
          timeout: 10000000,
          theme: 'default'
        }
        this.toastyService.warning(toastOptions);
      } else {
        this.exploreOppsToast.emit(false);
      }
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  getResults() {
    this.startSavePolling();
    this.toggleCalculate = !this.toggleCalculate;
  }

  focusField(str: string) {
    this.currentField = str;
  }

  changeTab(tab: LossTab) {
    this.lossTab = tab;
  }

  startSavePolling() {
    this.save.emit(true);
  }

  addModification() {
    console.log('click');
    this.lossesService.openNewModal.next(true);
  }
}
