import { Component, OnInit, ElementRef, ViewChild, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { BoilerBlowdownRateService, BoilerBlowdownRateInputs } from './boiler-blowdown-rate.service';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';
import { BoilerBlowdownRateTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';

@Component({
  selector: 'app-boiler-blowdown-rate',
  templateUrl: './boiler-blowdown-rate.component.html',
  styleUrls: ['./boiler-blowdown-rate.component.css']
})
export class BoilerBlowdownRateComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inTreasureHunt: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<BoilerBlowdownRateTreasureHunt>();
  @Output('emitCancel')
  emitCancel = new EventEmitter<boolean>();

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;

  baselineInputs: BoilerBlowdownRateInputs;
  modificationInputs: BoilerBlowdownRateInputs;
  modificationExists: boolean = false;
  modificationSub: Subscription;
  baselineSub: Subscription;
  baselineSelected: boolean = true;
  tabSelect: string = 'results';
  headerHeight: number;
  containerHeight: number;
  smallScreenTab: string = 'baseline';
  constructor(private boilerBlowdownRateService: BoilerBlowdownRateService, private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.initData();

    this.initSubscriptions();
    
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    if (!this.inTreasureHunt) {
      this.boilerBlowdownRateService.baselineInputs.next(this.baselineInputs);
      this.boilerBlowdownRateService.modificationInputs.next(this.modificationInputs);
    } else {
      this.boilerBlowdownRateService.baselineInputs.next(undefined);
      this.boilerBlowdownRateService.modificationInputs.next(undefined);
    }
    this.baselineSub.unsubscribe();
    this.modificationSub.unsubscribe();
  }

  initData() {
    let baselineInputs: BoilerBlowdownRateInputs = this.boilerBlowdownRateService.baselineInputs.getValue();
    if (!baselineInputs) {
      baselineInputs = this.boilerBlowdownRateService.getDefaultInputs(this.settings);
    } else {
      this.baselineInputs = this.boilerBlowdownRateService.baselineInputs.getValue();
    }
    this.boilerBlowdownRateService.baselineInputs.next(baselineInputs);
  }

  initSubscriptions() {
    this.baselineSub = this.boilerBlowdownRateService.baselineInputs.subscribe(value => {
      this.baselineInputs = value;
      //this.boilerBlowdownRateService.calculate(this.settings);
    });
    
    this.modificationSub = this.boilerBlowdownRateService.modificationInputs.subscribe(val => {
      if (val) {
        this.modificationInputs = val;
        this.modificationExists = true;
      } else {
        this.modificationExists = false;
      }
    });
  }

  createModification() {
    let baselineInputs: BoilerBlowdownRateInputs = this.boilerBlowdownRateService.baselineInputs.getValue();
    this.boilerBlowdownRateService.modificationInputs.next(baselineInputs);
    this.setModificationSelected();
  }

  setModificationSelected() {
    this.baselineSelected = false;
  }

  setBaselineSelected() {
    this.baselineSelected = true;
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  btnResetData() {
    this.boilerBlowdownRateService.modificationInputs.next(undefined);
    let baselineInputs: BoilerBlowdownRateInputs = this.boilerBlowdownRateService.getDefaultInputs(this.settings);
    this.boilerBlowdownRateService.baselineInputs.next(baselineInputs);
    this.boilerBlowdownRateService.showBoiler.next(false);
    this.boilerBlowdownRateService.showOperations.next(false);
    this.boilerBlowdownRateService.setForms.next(true);
    this.boilerBlowdownRateService.operatingHours.next(undefined);
  }

  btnGenerateExample() {
    let exampleData: { baseline: BoilerBlowdownRateInputs, modification: BoilerBlowdownRateInputs } = this.boilerBlowdownRateService.getExampleInputs(this.settings);
    this.boilerBlowdownRateService.modificationInputs.next(exampleData.modification);
    this.boilerBlowdownRateService.baselineInputs.next(exampleData.baseline);
    this.boilerBlowdownRateService.showBoiler.next(true);
    this.boilerBlowdownRateService.showOperations.next(true);
    this.boilerBlowdownRateService.setForms.next(true);
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
    if (this.smallScreenTab === 'baseline') {
      this.setBaselineSelected();
    } else if (this.smallScreenTab === 'modification') {
      this.setModificationSelected();
    }
  }

  save() {
    this.emitSave.emit({ baseline: this.baselineInputs, modification: this.modificationInputs, opportunityType: Treasure.boilerBlowdownRate });
  }

  cancel() {
    this.emitCancel.emit(true);
  }

}
