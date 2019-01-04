import { Component, OnInit, Input } from '@angular/core';
import { CalculateModelService } from '../../../ssmt-calculations/calculate-model.service';
import { PrvOutput } from '../../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-hover-prv-table',
  templateUrl: './hover-prv-table.component.html',
  styleUrls: ['./hover-prv-table.component.css']
})
export class HoverPrvTableComponent implements OnInit {
  @Input()
  prvType: string;

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
