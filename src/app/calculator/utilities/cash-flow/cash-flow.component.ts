import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-cash-flow',
  templateUrl: './cash-flow.component.html',
  styleUrls: ['./cash-flow.component.css']
})
export class CashFlowComponent implements OnInit {

  tabSelect: string = 'diagram';
  currentField: string;
  constructor() { }

  ngOnInit() {
      }

  setTab(str: string) {
    this.tabSelect = str;
  }

  setField(str: string) {
    this.currentField = str;
  }



}
