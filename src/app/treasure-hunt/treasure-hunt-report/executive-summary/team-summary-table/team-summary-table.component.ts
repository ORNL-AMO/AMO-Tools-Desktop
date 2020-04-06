import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-team-summary-table',
  templateUrl: './team-summary-table.component.html',
  styleUrls: ['./team-summary-table.component.css']
})
export class TeamSummaryTableComponent implements OnInit {
  @Input()
  teamData: Array<{ team: string, costSavings: number, implementationCost: number, paybackPeriod: number }>;
  
  constructor() { }

  ngOnInit(): void {
  }

}
