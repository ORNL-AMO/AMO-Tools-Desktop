import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { ChillerStagingInput } from '../../../shared/models/chillers';
// import { CalculatorDragBarService } from '../../../shared/calculator-drag-bar/calculator-drag-bar.service';
import { Settings } from '../../../shared/models/settings';
import { ChillerStagingTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';
import { ChillerStagingService } from './chiller-staging.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
  selector: 'app-chiller-staging',
  templateUrl: './chiller-staging.component.html',
  styleUrls: ['./chiller-staging.component.css']
})
export class ChillerStagingComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inTreasureHunt: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<ChillerStagingTreasureHunt>();
  @Output('emitCancel')
  emitCancel = new EventEmitter<boolean>();


  @ViewChild('contentContainer', { static: false }) public contentContainer: ElementRef;
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  chillerStagingInputSub: Subscription;
  chillerStagingInput: ChillerStagingInput;
  // calcFormWidth: number;
  // calcFormWidthSub: Subscription;
  // resultsHelpWidth: number;

  smallScreenTab: string = 'form';
  containerHeight: number;
  headerHeight: number;
  tabSelect: string = 'results';

  constructor(private chillerStagingService: ChillerStagingService,
    private settingsDbService: SettingsDbService,
    private analyticsService: AnalyticsService
    ) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-chiller-staging');
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.chillerStagingInput = this.chillerStagingService.chillerStagingInput.getValue();
    if (!this.chillerStagingInput) {
      this.chillerStagingService.initDefaultEmptyInputs(this.settings);
      this.chillerStagingService.initDefaultEmptyOutputs();
    }
    this.initSubscriptions();
  }

  ngOnDestroy() {
    if(!this.inTreasureHunt){
      this.chillerStagingService.chillerStagingInput.next(this.chillerStagingInput);
    } else {
      this.chillerStagingService.chillerStagingInput.next(undefined);
    }
    this.chillerStagingInputSub.unsubscribe();
    // this.calcFormWidthSub.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  initSubscriptions() {
    this.chillerStagingInputSub = this.chillerStagingService.chillerStagingInput.subscribe(value => {
      this.chillerStagingInput = value;
      if(value){
        this.calculate();
      }
    });

    // Commenting out for issue 5634, 4744
    // this.calcFormWidthSub = this.calculatorDragBarService.sidebarX.subscribe(val => {
    //   this.calcFormWidth = val;
    //   if (this.contentContainer && this.calcFormWidth) {
    //     this.resultsHelpWidth = this.contentContainer.nativeElement.clientWidth - this.calcFormWidth;
    //   }
    // });
  }

  calculate() {
    this.chillerStagingService.calculate(this.settings);
  }

  btnResetData() {
    this.chillerStagingService.initDefaultEmptyInputs(this.settings);
    this.chillerStagingService.resetData.next(true);
  }

  btnGenerateExample() {
    this.chillerStagingService.generateExampleData(this.settings);
    this.chillerStagingService.generateExample.next(true);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }

  save() {
    this.emitSave.emit({ chillerStagingData: this.chillerStagingInput, opportunityType: Treasure.chillerStaging });
  }

  cancel() {
    this.emitCancel.emit(true);
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

}
