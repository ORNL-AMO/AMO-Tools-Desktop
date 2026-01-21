import { Component, OnInit, ViewChild, HostListener, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { PowerFactorCorrectionInputs, PowerFactorCorrectionOutputs, PowerFactorCorrectionService } from './power-factor-correction.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { PowerFactorCorrectionTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-power-factor-correction',
    templateUrl: './power-factor-correction.component.html',
    styleUrls: ['./power-factor-correction.component.css'],
    standalone: false
})
export class PowerFactorCorrectionComponent implements OnInit {
  @Input()
  inTreasureHunt: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<PowerFactorCorrectionTreasureHunt>();
  @Output('emitCancel')
  emitCancel = new EventEmitter<boolean>();

  powerFactorInputs: PowerFactorCorrectionInputs;
  results: PowerFactorCorrectionOutputs;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }
  smallScreenTab: string = 'form';
  containerHeight: number;
  headerHeight: number;
  currentField: string;
  tabSelect: string = 'results';
  powerFactorInputSubscription: Subscription;

  constructor(private powerFactorCorrectionService: PowerFactorCorrectionService, private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-UTIL-power-factor-correction');

    this.powerFactorInputs = this.powerFactorCorrectionService.powerFactorInputs.getValue();
    if (!this.powerFactorInputs) {
      this.powerFactorCorrectionService.powerFactorInputs.next(this.powerFactorCorrectionService.getDefaultEmptyInputs());
      this.powerFactorCorrectionService.powerFactorOutputs.next(this.powerFactorCorrectionService.getEmptyPowerFactorCorrectionOutputs());
    }
    this.powerFactorInputSubscription = this.powerFactorCorrectionService.powerFactorInputs.subscribe(val => {
      this.powerFactorInputs = val;
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    if(!this.inTreasureHunt){
      this.powerFactorCorrectionService.powerFactorInputs.next(this.powerFactorInputs);
    } else {
      this.powerFactorCorrectionService.powerFactorInputs.next(undefined);
    }

    this.powerFactorInputSubscription.unsubscribe();
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

  save() {
    this.emitSave.emit({ inputData: this.powerFactorInputs, opportunityType: Treasure.powerFactorCorrection });
  }

  cancel() {
    this.emitCancel.emit(true);
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}
