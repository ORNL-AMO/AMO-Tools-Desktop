import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { PHAST } from '../../shared/models/phast/phast';
import { PhastService } from '../phast.service';
@Component({
  selector: 'app-metered-energy',
  templateUrl: './metered-energy.component.html',
  styleUrls: ['./metered-energy.component.css']
})
export class MeteredEnergyComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  phast: PHAST;

  // energyType: string = 'steam';

  constructor(private phastService: PhastService) { }

  ngOnInit() {
    console.log(this.phast);
    this.phastService.sumHeatInput(this.phast.losses);
  }

}
