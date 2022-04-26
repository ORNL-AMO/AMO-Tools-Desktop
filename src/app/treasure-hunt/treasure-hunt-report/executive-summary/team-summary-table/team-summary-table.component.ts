import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-team-summary-table',
  templateUrl: './team-summary-table.component.html',
  styleUrls: ['./team-summary-table.component.css']
})
export class TeamSummaryTableComponent implements OnInit {
  @Input()
  teamData: Array<{ team: string, costSavings: number, implementationCost: number, paybackPeriod: number }>;
  @Input()
  exportToPPT: boolean;
  
  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;
  
  constructor() { }

  ngOnInit(): void {
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }
}
