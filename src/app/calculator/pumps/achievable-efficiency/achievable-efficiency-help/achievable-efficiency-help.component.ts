import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-achievable-efficiency-help',
  templateUrl: './achievable-efficiency-help.component.html',
  styleUrls: ['./achievable-efficiency-help.component.css']
})
export class AchievableEfficiencyHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}
