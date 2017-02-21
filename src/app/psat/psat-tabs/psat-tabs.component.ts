import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-psat-tabs',
  templateUrl: './psat-tabs.component.html',
  styleUrls: ['./psat-tabs.component.css']
})
export class PsatTabsComponent implements OnInit {
  @Output('tabChange')
  tabChange = new EventEmitter<number>();
  @Input()
  currentTab: number;
  constructor() { }

  ngOnInit() {
  }

  changeTab(num: number){
    this.tabChange.emit(num);
  }

}
