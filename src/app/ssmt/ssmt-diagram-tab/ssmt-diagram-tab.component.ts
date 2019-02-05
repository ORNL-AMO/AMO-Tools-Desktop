import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { SSMT, SSMTInputs } from '../../shared/models/steam/ssmt';
import { Settings } from '../../shared/models/settings';
import { SSMTOutput } from '../../shared/models/steam/steam-outputs';
import { CalculateModelService } from '../ssmt-calculations/calculate-model.service';

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
  selectedTable: string = 'cost';

  selectedSSMT: SSMT;
  ssmtOptions: Array<SSMT>;
  showOptions: boolean = false;
  constructor(private calculateModelService: CalculateModelService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.ssmt.name = 'Baseline';
    this.selectedSSMT = this.ssmt;
    this.ssmtOptions = new Array<SSMT>();
    if(this.ssmt.modifications){
      this.ssmtOptions.push(this.ssmt);
      this.ssmt.modifications.forEach(modification => {
        this.ssmtOptions.push(modification.ssmt);
      })
    }
    if (this.ssmt.setupDone) {
      this.calculateResults();
    }
  }

  setOption(ssmt: SSMT){
    this.selectedSSMT = ssmt;
    this.calculateResults();
    this.showOptions = false;
  }

  calculateResults() {
    this.calculateModelService.initResults();
    this.calculateModelService.initData(this.selectedSSMT, this.settings, true);
    let resultsData: {inputData: SSMTInputs, outputData: SSMTOutput} = this.calculateModelService.calculateModelRunner();
    this.inputData = resultsData.inputData;
    this.outputData = resultsData.outputData;
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

  toggleShowOptions(){
    this.showOptions = !this.showOptions;
  }
}
