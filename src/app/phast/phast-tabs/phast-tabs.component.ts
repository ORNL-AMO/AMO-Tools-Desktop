import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { PhastService } from '../phast.service';
@Component({
  selector: 'app-phast-tabs',
  templateUrl: './phast-tabs.component.html',
  styleUrls: ['./phast-tabs.component.css']
})
export class PhastTabsComponent implements OnInit {

  currentTab: string;
  constructor(private phastService: PhastService) { }

  ngOnInit() {
    this.phastService.secondaryTab.subscribe(val => {
      this.currentTab = val;
    })
  }

  changeTab(str: string){
    this.phastService.secondaryTab.next(str);
  }

}
