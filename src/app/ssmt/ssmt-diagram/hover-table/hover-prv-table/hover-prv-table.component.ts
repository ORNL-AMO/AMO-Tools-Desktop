import { Component, OnInit, Input } from '@angular/core';
import { CalculateModelService } from '../../../ssmt-calculations/calculate-model.service';
import { PrvOutput, SSMTOutput } from '../../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../../shared/models/settings';
import { SSMTInputs } from '../../../../shared/models/steam/ssmt';

@Component({
  selector: 'app-hover-prv-table',
  templateUrl: './hover-prv-table.component.html',
  styleUrls: ['./hover-prv-table.component.css']
})
export class HoverPrvTableComponent implements OnInit {
  @Input()
  prvType: string;
  @Input()
  settings: Settings;
  @Input()
  outputData: SSMTOutput;
  @Input()
  inputData: SSMTInputs;
  prv: PrvOutput;
  prvLabel: string;
  constructor() { }

  ngOnInit() {
    if(this.prvType == 'highToMediumPressurePRV'){
      this.prv = this.outputData.highToMediumPressurePRV;
      this.prvLabel = 'High to Medium';
    }else if(this.prvType == 'lowPressurePRV'){
      this.prv = this.outputData.lowPressurePRV;
      if(this.inputData.headerInput.numberOfHeaders == 3){
        this.prvLabel = 'Medium to Low';
      }else{
        this.prvLabel = 'High to Low';
      }
    }
  }

}
