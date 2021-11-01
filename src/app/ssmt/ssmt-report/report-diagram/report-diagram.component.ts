import { Component, OnInit, Input } from '@angular/core';
import { SSMT, SSMTInputs, SsmtValid, DiagramData } from '../../../shared/models/steam/ssmt';
import { Settings } from '../../../shared/models/settings';
import { SSMTOutput } from '../../../shared/models/steam/steam-outputs';
import { Assessment } from '../../../shared/models/assessment';
import { SsmtService } from '../../ssmt.service';

@Component({
  selector: 'app-report-diagram',
  templateUrl: './report-diagram.component.html',
  styleUrls: ['./report-diagram.component.css']
})
export class ReportDiagramComponent implements OnInit {
  @Input()
  inputData: SSMTInputs;
  @Input()
  diagramData: DiagramData;
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;
  @Input()
  baselineOutput: SSMTOutput;
  @Input()
  modificationOutputs: Array<{name: string, outputData: SSMTOutput, valid: SsmtValid}>;
  @Input()
  modificationInputData: Array<{ name: string, inputData: SSMTInputs, valid: SsmtValid }>;
  

  ssmt1: SSMT;
  ssmt2: SSMT;
  ssmt1Baseline: boolean = true;
  ssmt2Baseline: boolean = false;
  
  
 
  modificationDiagramData: Array<DiagramData> = [];
  selectedDiagram1: DiagramData;
  selectedDiagram2: DiagramData;
  ssmtBaselineDiagram1: DiagramData;
  ssmtBaselineDiagram2: DiagramData;


  constructor(private ssmtService: SsmtService) { }

  ngOnInit() {
    this.ssmtBaselineDiagram1 = {       
      name: this.assessment.ssmt.name,
      inputData: this.inputData,
      outputData: this.baselineOutput,
      valid: this.ssmtService.checkValid(this.assessment.ssmt, this.settings)

    };
    this.ssmtBaselineDiagram2 = {       
      name: this.assessment.ssmt.name,
      inputData: this.inputData,
      outputData: this.baselineOutput,
      valid: this.ssmtService.checkValid(this.assessment.ssmt, this.settings)

    };

    this.selectedDiagram1 = this.ssmtBaselineDiagram1;
    this.selectedDiagram2 = this.ssmtBaselineDiagram2;
     this.assessment.ssmt.modifications.forEach((modification, index) => {
      let diagramData: DiagramData  = {
        name: modification.ssmt.name,
        inputData: this.modificationInputData[index].inputData,
        outputData: this.modificationOutputs[index].outputData,
        valid: this.ssmtService.checkValid(modification.ssmt, this.settings)
      };
      this.modificationDiagramData.push(diagramData);
    });
    this.ssmt1 = this.assessment.ssmt;
    if (this.assessment.ssmt.modifications.length != 0) {
      this.ssmt2 = this.assessment.ssmt.modifications[0].ssmt;
    }
  }

  
  setSsmt1() {
    if(this.selectedDiagram1.name === this.ssmtBaselineDiagram1.name){
      this.ssmt1Baseline = true;
    }
  }
  
  setSsmt2() {
    if(this.selectedDiagram2.name === this.ssmtBaselineDiagram2.name){
      this.ssmt2Baseline = true;
    }
  }
}


