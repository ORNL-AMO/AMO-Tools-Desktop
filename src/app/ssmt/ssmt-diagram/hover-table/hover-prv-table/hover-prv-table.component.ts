import { Component, OnInit, Input } from '@angular/core';
import { PrvOutput, SSMTOutput } from '../../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../../shared/models/settings';
import { SSMTInputs } from '../../../../shared/models/steam/ssmt';

@Component({
    selector: 'app-hover-prv-table',
    templateUrl: './hover-prv-table.component.html',
    styleUrls: ['./hover-prv-table.component.css'],
    standalone: false
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
    if (this.prvType === 'highToMediumPressurePRV') {
      this.prv = this.outputData.highPressureToMediumPressurePrv;
      this.prvLabel = 'High to Medium';
    }else if (this.prvType === 'lowPressurePRV') {
      this.prv = this.outputData.mediumPressureToLowPressurePrv;
      if (this.inputData.headerInput.numberOfHeaders === 3) {
        this.prvLabel = 'Medium to Low';
      }else {
        this.prvLabel = 'High to Low';
      }
    }
  }

}
