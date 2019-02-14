import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { BoilerOutput } from '../../../shared/models/steam/steam-outputs';
import { SSMTInputs } from '../../../shared/models/steam/ssmt';
import { Settings } from '../../../shared/models/settings';
import { SsmtDiagramTabService } from '../ssmt-diagram-tab.service';

@Component({
  selector: 'app-boiler-table',
  templateUrl: './boiler-table.component.html',
  styleUrls: ['./boiler-table.component.css']
})
export class BoilerTableComponent implements OnInit {
  @Input()
  boiler: BoilerOutput;
  @Input()
  inputData: SSMTInputs;
  @Input()
  settings: Settings;
  @Output('emitShowCalc')
  emitShowCalc = new EventEmitter<boolean>();

  constructor(private ssmtDiagramTabService: SsmtDiagramTabService) { }

  ngOnInit() {
  }

  goToCalculator(){
    this.ssmtDiagramTabService.setBoilerCalculator(this.inputData, this.boiler);
    this.emitShowCalc.emit(true);
  }
}
