import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modify-conditions-tabs',
  templateUrl: './modify-conditions-tabs.component.html',
  styleUrls: ['./modify-conditions-tabs.component.css']
})
export class ModifyConditionsTabsComponent implements OnInit {
  @Input()
  modifyTab: string;
  @Output('changeTab')
  changeTab= new EventEmitter<string>();
  constructor() { }

  ngOnInit() {
  }

  tabChange(str: string){
    this.changeTab.emit(str);
  }
}
