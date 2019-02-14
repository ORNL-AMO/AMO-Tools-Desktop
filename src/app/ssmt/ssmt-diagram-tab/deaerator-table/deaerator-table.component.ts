import { Component, OnInit, Input, Output } from '@angular/core';
import { DeaeratorOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';
import { SsmtDiagramTabService } from '../ssmt-diagram-tab.service';
import { SSMTInputs } from '../../../shared/models/steam/ssmt';

@Component({
  selector: 'app-deaerator-table',
  templateUrl: './deaerator-table.component.html',
  styleUrls: ['./deaerator-table.component.css']
})
export class DeaeratorTableComponent implements OnInit {
  @Input()
  deaerator: DeaeratorOutput;
  @Input()
  settings: Settings;
  @Input()
  inputData: SSMTInputs;

  constructor(private ssmtDiagramTabService: SsmtDiagramTabService) { }

  ngOnInit() {
  }

  goToCalculator(){
    this.ssmtDiagramTabService.setDeaeratorCalculator(this.deaerator, this.inputData);
  }
}
