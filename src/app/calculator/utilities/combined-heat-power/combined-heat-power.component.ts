import { Component, OnInit } from '@angular/core';
import { StandaloneService } from '../../standalone.service';
@Component({
  selector: 'app-combined-heat-power',
  templateUrl: './combined-heat-power.component.html',
  styleUrls: ['./combined-heat-power.component.css']
})
export class CombinedHeatPowerComponent implements OnInit {

  constructor(private standaloneService: StandaloneService) { }

  ngOnInit() {
    this.standaloneService.test();
    //this.standaloneService.CHPcalculator({})
  }

}
