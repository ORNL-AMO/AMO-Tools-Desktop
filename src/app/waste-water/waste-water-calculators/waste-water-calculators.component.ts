import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { WasteWaterService } from '../waste-water.service';

@Component({
    selector: 'app-waste-water-calculators',
    templateUrl: './waste-water-calculators.component.html',
    styleUrls: ['./waste-water-calculators.component.css'],
    standalone: false
})
export class WasteWaterCalculatorsComponent implements OnInit {

  @Input()
  assessment: Assessment;
  @Input()
  settings: Settings;
  
  calcTabSub: Subscription;
  calcTab: string;
  constructor(private wasteWaterService: WasteWaterService) { }

  ngOnInit(): void {
    this.settings = this.wasteWaterService.settings.getValue();
    this.calcTabSub = this.wasteWaterService.calcTab.subscribe(currentCalcTab => {
      this.calcTab = currentCalcTab;
    });
  }

  ngOnDestroy() {
    this.calcTabSub.unsubscribe();
  }

  changeCalcTab(str: string) {
    this.wasteWaterService.calcTab.next(str);
  }

}
