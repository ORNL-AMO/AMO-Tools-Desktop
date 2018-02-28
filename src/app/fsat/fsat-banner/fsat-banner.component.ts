import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { FsatService } from '../fsat.service';
//import { Fan203Circular } from '../../fans/fan.service';
import { FanRatedInfo, BaseGasDensity, FanShaftPower } from '../../shared/models/fans';

@Component({
  selector: 'app-fsat-banner',
  templateUrl: './fsat-banner.component.html',
  styleUrls: ['./fsat-banner.component.css']
})
export class FsatBannerComponent implements OnInit {
  @Input()
  assessment: Assessment;

  mainTab: string;
  //fan: Fan203Circular;
  constructor(private fsatService: FsatService) { }

  ngOnInit() {
    // let tmpInfo: FanRatedInfo;
    // let tmpGasDensity: BaseGasDensity;
    // let tmpShaftPower: FanShaftPower;
    // let tmpPlane: PlaneDataCircular;
    // this.fan = new Fan203Circular(tmpInfo, tmpPlane, tmpGasDensity, tmpShaftPower)
    // console.log(this.fan);

    this.fsatService.mainTab.subscribe(val => {
      this.mainTab = val;
    })
  }
  
  changeTab(str: string) {
    this.fsatService.mainTab.next(str);
  }
}
