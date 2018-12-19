import { Component, OnInit, Input } from '@angular/core';
import { BoilerOutput } from '../../../shared/models/steam/steam-outputs';
import { SSMTInputs } from '../../../shared/models/steam/ssmt';

@Component({
  selector: 'app-boiler-diagram',
  templateUrl: './boiler-diagram.component.html',
  styleUrls: ['./boiler-diagram.component.css']
})
export class BoilerDiagramComponent implements OnInit {
  @Input()
  boiler: BoilerOutput;
  @Input()
  inputData: SSMTInputs;
  
  constructor() { }

  ngOnInit() {
  }

}
