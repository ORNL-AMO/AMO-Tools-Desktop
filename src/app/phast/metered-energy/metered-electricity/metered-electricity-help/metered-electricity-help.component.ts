import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-metered-electricity-help',
  templateUrl: './metered-electricity-help.component.html',
  styleUrls: ['./metered-electricity-help.component.css']
})
export class MeteredElectricityHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
