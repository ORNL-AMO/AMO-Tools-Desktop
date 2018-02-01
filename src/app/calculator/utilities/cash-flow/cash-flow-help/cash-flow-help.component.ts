import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-cash-flow-help',
  templateUrl: './cash-flow-help.component.html',
  styleUrls: ['./cash-flow-help.component.css']
})
export class CashFlowHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
