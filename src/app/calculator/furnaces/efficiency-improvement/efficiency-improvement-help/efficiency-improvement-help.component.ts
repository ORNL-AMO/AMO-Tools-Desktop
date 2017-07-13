import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-efficiency-improvement-help',
  templateUrl: './efficiency-improvement-help.component.html',
  styleUrls: ['./efficiency-improvement-help.component.css']
})
export class EfficiencyImprovementHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
