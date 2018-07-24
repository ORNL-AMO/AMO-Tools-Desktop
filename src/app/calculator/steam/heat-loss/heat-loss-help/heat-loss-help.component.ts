import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-heat-loss-help',
  templateUrl: './heat-loss-help.component.html',
  styleUrls: ['./heat-loss-help.component.css']
})
export class HeatLossHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
