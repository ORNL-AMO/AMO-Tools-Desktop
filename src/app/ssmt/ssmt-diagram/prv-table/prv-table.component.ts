import { Component, OnInit, Input } from '@angular/core';
import { PrvOutput } from '../../../shared/models/steam/steam-outputs';
import { CalculateModelService } from '../../ssmt-calculations/calculate-model.service';
import { Settings } from '../../../shared/models/settings';

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
  
  prv: PrvOutput;
  prvLabel: string;
  constructor(private calculateModelService: CalculateModelService) { }

  ngOnInit() {
    if(this.prvType == 'highToMediumPressurePRV'){
      this.prv = this.calculateModelService.highToMediumPressurePRV;
      this.prvLabel = 'High to Medium';
    }else if(this.prvType == 'lowPressurePRV'){
      this.prv = this.calculateModelService.lowPressurePRV;
      if(this.calculateModelService.inputData.headerInput.numberOfHeaders == 3){
        this.prvLabel = 'Medium to Low';
      }else{
        this.prvLabel = 'High to Low';
      }
    }
  }
}
