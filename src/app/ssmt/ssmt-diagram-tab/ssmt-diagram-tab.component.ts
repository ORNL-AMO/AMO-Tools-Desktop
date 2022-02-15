import { Component, OnInit, Input, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { SSMT, SSMTInputs } from '../../shared/models/steam/ssmt';
import { Settings } from '../../shared/models/settings';
import { SSMTOutput } from '../../shared/models/steam/steam-outputs';
import { SsmtService } from '../ssmt.service';

@Component({
  selector: 'app-ssmt-diagram-tab',
  templateUrl: './ssmt-diagram-tab.component.html',
  styleUrls: ['./ssmt-diagram-tab.component.css']
})
export class SsmtDiagramTabComponent implements OnInit {
  @Input()
  ssmt: SSMT;
  @Input()
  settings: Settings;
  @Input()
  containerHeight: number;


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setScaleValue();
  }

  @ViewChild('diagramContainer', { static: false }) diagramContainer: ElementRef;

  outputData: SSMTOutput;
  inputData: SSMTInputs;
  tabSelect: string = 'results';
  hoveredEquipment: string = 'default';
  selectedTable: string = 'default';

  selectedSSMT: SSMT;
  dataCalculated: boolean = false;
  displayCalculators: boolean = false;
  scaleValue: number = 100;

  sidebarCollapsed: boolean;

  setDiagramPixelWidth: number = 900;
  baselineResults: SSMTOutput;
  constructor(private ssmtService: SsmtService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.ssmt.name = 'Baseline';
    this.baselineResults = this.ssmtService.calculateBaselineModel(this.ssmt, this.settings).outputData;
    this.selectedSSMT = this.ssmt;
    this.calculateResults();
  }

  ngAfterViewInit() {
    this.setScaleValue();
  }

  collapseSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  setScaleValue() {
    if (this.diagramContainer) {
      let containerWidth: number = this.diagramContainer.nativeElement.clientWidth;
      let scaleDecimal: number = containerWidth / this.setDiagramPixelWidth - .025;
      this.scaleValue = scaleDecimal * 100;
      this.cd.detectChanges();
    } else {
      this.scaleValue = 100;
      this.cd.detectChanges();
    }
  }

  calculateResults() {
    let resultsData: { inputData: SSMTInputs, outputData: SSMTOutput };
    if (this.selectedSSMT.name == 'Baseline') {
      resultsData = this.ssmtService.calculateBaselineModel(this.selectedSSMT, this.settings);
    } else {
      resultsData = this.ssmtService.calculateModificationModel(this.selectedSSMT, this.settings, this.baselineResults);
    }
    this.inputData = resultsData.inputData;
    this.outputData = resultsData.outputData;
    this.dataCalculated = true;
    this.selectedTable = 'default';
  }

  calculateResultsWithMarginalCosts() {
    let marginalCosts: { marginalHPCost: number, marginalMPCost: number, marginalLPCost: number };
    if (this.selectedSSMT.name == 'Baseline') {
      marginalCosts = this.ssmtService.calculateBaselineMarginalCosts(this.selectedSSMT, this.outputData, this.settings);
    } else {
      marginalCosts = this.ssmtService.calculateModificationMarginalCosts(this.selectedSSMT, this.outputData, this.baselineResults, this.settings);
    }
    this.outputData.marginalHPCost = marginalCosts.marginalHPCost;
    this.outputData.marginalMPCost = marginalCosts.marginalMPCost;
    this.outputData.marginalLPCost = marginalCosts.marginalLPCost;
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  setHover(str: string) {
    this.hoveredEquipment = str;
  }

  selectTable(str: string) {
    this.selectedTable = str;
  }

  scaleUp() {
    this.scaleValue = this.scaleValue + 5;
  }

  scaleDown() {
    this.scaleValue = this.scaleValue - 5;
  }
}
