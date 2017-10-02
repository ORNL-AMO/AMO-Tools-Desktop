import { Component, OnInit, Input } from '@angular/core';
import { CashFlowResults } from '../cash-flow';

@Component({
  selector: 'app-cash-flow-diagram',
  templateUrl: './cash-flow-diagram.component.html',
  styleUrls: ['./cash-flow-diagram.component.css']
})
export class CashFlowDiagramComponent implements OnInit {
  @Input()
  cashFlowResults: CashFlowResults;
  constructor() { }

  ngOnInit() {
  }

}
