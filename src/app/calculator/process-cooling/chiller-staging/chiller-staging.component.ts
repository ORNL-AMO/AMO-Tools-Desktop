import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';
import { CalculatorService } from '../../calculator.service';
import { ChillerStagingService } from './chiller-staging.service';

@Component({
  selector: 'app-chiller-staging',
  templateUrl: './chiller-staging.component.html',
  styleUrls: ['./chiller-staging.component.css']
})
export class ChillerStagingComponent implements OnInit {
  @Input()
  settings: Settings;

  
  @ViewChild('contentContainer', { static: false }) public contentContainer: ElementRef;

  
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }
  
  chillerPerformanceInputSub: Subscription;

  calcFormWidth: number;
  calcFormWidthSub: Subscription;
  reslutsHelpWidth: number;
  
  headerHeight: number;
  tabSelect: string = 'results';
  
  constructor(private chillerStagingService: ChillerStagingService,
              private settingsDbService: SettingsDbService, 
              private cd: ChangeDetectorRef) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.calcFormWidthSub = this.chillerStagingService.sidebarX.subscribe(val => {
      this.calcFormWidth = val;
      if (this.contentContainer && this.calcFormWidth) {
        this.reslutsHelpWidth = this.contentContainer.nativeElement.clientWidth - this.calcFormWidth;
      }
    });
    let existingInputs = this.chillerStagingService.chillerStagingInput.getValue();
    if(!existingInputs) {
      this.chillerStagingService.initDefaultEmptyInputs();
      this.chillerStagingService.initDefaultEmptyOutputs();
    }
    if (this.contentContainer && this.calcFormWidth) {
      this.reslutsHelpWidth = this.contentContainer.nativeElement.clientWidth - this.calcFormWidth;
      this.cd.detectChanges();
    }

    
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.chillerPerformanceInputSub.unsubscribe();
    this.calcFormWidthSub.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
    if (this.contentContainer && this.calcFormWidth) {
      this.reslutsHelpWidth = this.contentContainer.nativeElement.clientWidth - this.calcFormWidth;
      this.cd.detectChanges();
    }
  }

  initSubscriptions() {
    this.chillerPerformanceInputSub = this.chillerStagingService.chillerStagingInput.subscribe(value => {
      this.calculate();
    });
  }

  calculate() {
    this.chillerStagingService.calculate(this.settings);
  }

  btnResetData() {
    this.chillerStagingService.initDefaultEmptyInputs();
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
    }
  }

}
