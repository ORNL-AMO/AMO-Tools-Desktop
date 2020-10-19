import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WasteWaterService } from '../../waste-water.service';

@Component({
  selector: 'app-modify-conditions-tabs',
  templateUrl: './modify-conditions-tabs.component.html',
  styleUrls: ['./modify-conditions-tabs.component.css']
})
export class ModifyConditionsTabsComponent implements OnInit {


  modifyConditionsTab: string;
  modifyConditionsTabSub: Subscription;
  constructor(private wasteWaterService: WasteWaterService) { }

  ngOnInit(): void {
    this.modifyConditionsTabSub = this.wasteWaterService.modifyConditionsTab.subscribe(val => {
      this.modifyConditionsTab = val;
    });
  }

  ngOnDestroy() {
    this.modifyConditionsTabSub.unsubscribe();
  }

  tabChange(str: string) {
    this.wasteWaterService.modifyConditionsTab.next(str);
  }
}
