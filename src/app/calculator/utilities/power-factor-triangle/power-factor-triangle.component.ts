import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { PowerFactorTriangleService } from './power-factor-triangle.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { PowerFactorTriangleInputs, PowerFactorTriangleOutputs } from '../../../shared/models/standalone';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-power-factor-triangle',
  templateUrl: './power-factor-triangle.component.html',
  styleUrls: ['./power-factor-triangle.component.css']
})
export class PowerFactorTriangleComponent implements OnInit {

  inputData: PowerFactorTriangleInputs = {
    mode: 1,
    apparentPower: 100,
    realPower: 87,
    reactivePower: 49.31,
    phaseAngle: 29.5,
    powerFactor: 0.87,
  };
  results: PowerFactorTriangleOutputs;

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
  toggleCalculate: boolean = false;
  tabSelect: string = 'results';
  powerFactorTriangleForm: UntypedFormGroup;
  constructor(private powerFactorTriangleService: PowerFactorTriangleService,
    private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-UTIL-power-factor-correction');
    if (!this.powerFactorTriangleService.inputData) {
      this.generateExample();
    } else{
      this.inputData = this.powerFactorTriangleService.inputData;
      this.powerFactorTriangleForm = this.powerFactorTriangleService.getFormFromObj(this.inputData);
    }
    this.calculate(this.powerFactorTriangleForm);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    this.powerFactorTriangleService.inputData = this.inputData;
  }

  btnResetData() {
    this.inputData = this.powerFactorTriangleService.getResetData();
    this.powerFactorTriangleService.inputData = this.inputData;
    this.powerFactorTriangleForm = this.powerFactorTriangleService.getFormFromObj(this.inputData);
    this.calculate(this.powerFactorTriangleForm);
  }

  generateExample() {
    this.inputData = this.powerFactorTriangleService.generateExample();
    this.powerFactorTriangleForm = this.powerFactorTriangleService.getFormFromObj(this.inputData);
    this.powerFactorTriangleService.inputData = this.inputData;
  }

  btnGenerateExample() {
    this.generateExample();
    this.calculate(this.powerFactorTriangleForm);
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
  changeField(str: string) {
    this.currentField = str;
  }

  calculate(form: UntypedFormGroup) {
    this.powerFactorTriangleForm = form;
    this.inputData = this.powerFactorTriangleService.getObjFromForm(form);
    this.results = this.powerFactorTriangleService.getResults(this.inputData);
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}





