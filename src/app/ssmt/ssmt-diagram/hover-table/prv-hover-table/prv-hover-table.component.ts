import { Component, OnInit, Input } from '@angular/core';
import { CalculateModelService } from '../../../ssmt-calculations/calculate-model.service';
import { PrvOutput } from '../../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-prv-hover-table',
  templateUrl: './prv-hover-table.component.html',
  styleUrls: ['./prv-hover-table.component.css']
})
export class PrvHoverTableComponent implements OnInit {
  @Input()
  prvType: string;

  prv: PrvOutput;
  constructor(private calculateModelService: CalculateModelService) { }

  ngOnInit() {
    if(this.prvType == 'highToMediumPressurePRV'){
      this.prv = this.calculateModelService.highToMediumPressurePRV;
    }else if(this.prvType == 'lowPressurePRV'){
      this.prv = this.calculateModelService.lowPressurePRV;
    }
  }

}
