import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { PHAST } from '../../shared/models/phast/phast';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { LossTab } from '../tabs';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { LossesService } from '../losses/losses.service';

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
  @Output('save')
  save = new EventEmitter<boolean>();
  @Output('emitAddNewMod')
  emitAddNewMod = new EventEmitter<boolean>();

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
  toastData: { title: string, body: string, setTimeoutVal: number } = { title: '', body: '', setTimeoutVal: undefined };
  showToast: boolean = false;
  isModalOpen: boolean = false;
  modalOpenSubscription: Subscription;
  constructor(private lossesService: LossesService) {
  }

  ngOnInit() {
    this.modalOpenSubscription = this.lossesService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
    }); 
    this.checkExists();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.firstChange) {
        this.checkExists();
        this.checkExploreOpps();
      }
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.checkExploreOpps();
    }, 100)
  }

  ngOnDestroy(){
    this.modalOpenSubscription.unsubscribe();
  }

  checkExists() {
    if ((this.exploreModIndex || this.exploreModIndex === 0) && this.phast.modifications.length !== 0) {
      this.modExists = true;
    } else {
      this.modExists = false;
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
    this.lossesService.openNewModal.next(true);
  }

  addNewMod() {
    this.emitAddNewMod.emit(true);
  }


  checkExploreOpps() {
    if (this.modExists) {
      if (!this.phast.modifications[this.exploreModIndex].exploreOpportunities) {
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
