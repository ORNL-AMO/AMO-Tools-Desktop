import { Component, OnInit, Input } from '@angular/core';
import { PrvOutput } from '../../../shared/models/steam/steam-outputs';
import { CalculateModelService } from '../../ssmt-calculations/calculate-model.service';
import { Settings } from '../../../shared/models/settings';
import { SSMTInputs } from '../../../shared/models/steam/ssmt';

@Component({
  selector: 'app-prv-table',
  templateUrl: './prv-table.component.html',
  styleUrls: ['./prv-table.component.css']
})
export class PrvTableComponent implements OnInit {
  @Input()
  prvType:string;
  @Input()
  settings: Settings;
  @Input()
  prv: PrvOutput;
  @Input()
  inputData: SSMTInputs;

  prvLabel: string;
  constructor() { }

  ngOnInit() {
    if(this.prvType == 'highToMediumPressurePRV'){
      this.prvLabel = 'High to Medium';
    }else if(this.prvType == 'lowPressurePRV'){
      if(this.inputData.headerInput.numberOfHeaders == 3){
        this.prvLabel = 'Medium to Low';
      }else{
        this.prvLabel = 'High to Low';
      }
    }
  }
}
