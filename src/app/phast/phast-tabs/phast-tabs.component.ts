import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-phast-tabs',
  templateUrl: './phast-tabs.component.html',
  styleUrls: ['./phast-tabs.component.css']
})
export class PhastTabsComponent implements OnInit {
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
