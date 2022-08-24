import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { ChillerStagingInput } from '../../../shared/models/chillers';
// import { CalculatorDragBarService } from '../../../shared/calculator-drag-bar/calculator-drag-bar.service';
import { Settings } from '../../../shared/models/settings';
import { ChillerStagingTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';
import { ChillerStagingService } from './chiller-staging.service';

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
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  chillerPerformanceInputSub: Subscription;
  chillerPerformanceInput: ChillerStagingInput;
  // calcFormWidth: number;
  // calcFormWidthSub: Subscription;
  // resultsHelpWidth: number;

  containerHeight: number;
  headerHeight: number;
  tabSelect: string = 'results';

  constructor(private chillerStagingService: ChillerStagingService,
    private settingsDbService: SettingsDbService,
    // private calculatorDragBarService: CalculatorDragBarService
    ) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.chillerPerformanceInput = this.chillerStagingService.chillerStagingInput.getValue();
    if (!this.chillerPerformanceInput) {
      this.chillerStagingService.initDefaultEmptyInputs(this.settings);
      this.chillerStagingService.initDefaultEmptyOutputs();
    }
    this.initSubscriptions();
  }

  ngOnDestroy() {
    if(!this.inTreasureHunt){
      this.chillerStagingService.chillerStagingInput.next(this.chillerPerformanceInput);
    } else {
      this.chillerStagingService.chillerStagingInput.next(undefined);
    }
    this.chillerPerformanceInputSub.unsubscribe();
    // this.calcFormWidthSub.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  initSubscriptions() {
    this.chillerPerformanceInputSub = this.chillerStagingService.chillerStagingInput.subscribe(value => {
      this.chillerPerformanceInput = value;
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
    }
  }

  save() {
    this.emitSave.emit({ chillerStagingData: this.chillerPerformanceInput, opportunityType: Treasure.chillerStaging });
  }

  cancel() {
    this.emitCancel.emit(true);
  }

}
