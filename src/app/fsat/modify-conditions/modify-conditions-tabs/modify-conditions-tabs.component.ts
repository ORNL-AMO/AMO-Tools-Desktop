import { Component, OnInit } from '@angular/core';
import { ModifyConditionsService } from '../modify-conditions.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modify-conditions-tabs',
  templateUrl: './modify-conditions-tabs.component.html',
  styleUrls: ['./modify-conditions-tabs.component.css']
})
export class ModifyConditionsTabsComponent implements OnInit {

  modifyConditionsTab: string;
  modifyConditionsTabSub: Subscription;
  constructor(private modifyConditionsService: ModifyConditionsService) { }

  ngOnInit() {
    this.modifyConditionsTabSub = this.modifyConditionsService.modifyConditionsTab.subscribe(val => {
      this.modifyConditionsTab = val;
      console.log(this.modifyConditionsTab);
    })
  }

  ngOnDestroy(){
    this.modifyConditionsTabSub.unsubscribe();
  }

  changeModTab(str: string){
    this.modifyConditionsService.modifyConditionsTab.next(str);
  }
}
