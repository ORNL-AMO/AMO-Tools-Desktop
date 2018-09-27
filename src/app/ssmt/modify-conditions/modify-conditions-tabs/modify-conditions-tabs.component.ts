import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { SsmtService } from '../../ssmt.service';

@Component({
  selector: 'app-modify-conditions-tabs',
  templateUrl: './modify-conditions-tabs.component.html',
  styleUrls: ['./modify-conditions-tabs.component.css']
})
export class ModifyConditionsTabsComponent implements OnInit {
  @Input()
  settings: Settings;

  modelTab: string;
  modelTabSubscription:Subscription;
  constructor(private ssmtService: SsmtService) { }

  ngOnInit() {
    this.modelTabSubscription = this.ssmtService.steamModelTab.subscribe(val => {
      this.modelTab = val;
    })
  }

  ngOnDestory(){
    this.modelTabSubscription.unsubscribe();
  }

  changeModelTab(str: string){
    this.ssmtService.steamModelTab.next(str);
  }
}
