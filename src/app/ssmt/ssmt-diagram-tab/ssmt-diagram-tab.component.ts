import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { SSMT, SSMTInputs } from '../../shared/models/steam/ssmt';
import { Settings } from '../../shared/models/settings';
import { SSMTOutput } from '../../shared/models/steam/steam-outputs';
import { CalculateModelService } from '../ssmt-calculations/calculate-model.service';
import { Subscription } from 'rxjs';
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

  outputData: SSMTOutput;
  inputData: SSMTInputs;
  tabSelect: string = 'results';
  hoveredEquipment: string = 'default';
  selectedTable: string = 'default';

  selectedSSMT: SSMT;
  ssmtOptions: Array<SSMT>;
  showOptions: boolean = false;
  dataCalculated: boolean = false;
  displayCalculators: boolean = false;
  calculatorTab: string;
  calculatorTabSubscription: Subscription;
  constructor(private calculateModelService: CalculateModelService, private ssmtService: SsmtService) { }

  ngOnInit() {
    this.ssmt.name = 'Baseline';
    this.selectedSSMT = this.ssmt;
    this.ssmtOptions = new Array<SSMT>();
    if (this.ssmt.modifications) {
      this.ssmtOptions.push(this.ssmt);
      this.ssmt.modifications.forEach(modification => {
        this.ssmtOptions.push(modification.ssmt);
      })
    }
    if (this.ssmt.setupDone) {
      this.calculateResults();
    }

    this.calculatorTabSubscription = this.ssmtService.calcTab.subscribe(val => {
      this.calculatorTab = val;
    })
  }

  ngOnDestroy(){
    this.calculatorTabSubscription.unsubscribe();
  }

  // setOption(ssmt: SSMT) {
  //   this.selectedSSMT = ssmt;
  //   this.calculateResults();
  //   this.showOptions = false;
  // }

  calculateResults() {
    setTimeout(() => {
      this.calculateModelService.initResults();
      this.calculateModelService.initData(this.selectedSSMT, this.settings, true);
      let resultsData: { inputData: SSMTInputs, outputData: SSMTOutput } = this.calculateModelService.calculateModelRunner();
      this.inputData = resultsData.inputData;
      this.outputData = resultsData.outputData;
      this.dataCalculated = true;
    }, 100)
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

  toggleShowOptions() {
    this.showOptions = !this.showOptions;
  }

  showCalculators(){
    this.displayCalculators = true;
  }

  closeCalculator(){
    this.displayCalculators = false;
  }
}
