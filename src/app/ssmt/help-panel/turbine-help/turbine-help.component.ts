import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-turbine-help',
  templateUrl: './turbine-help.component.html',
  styleUrls: ['./turbine-help.component.css']
})
export class TurbineHelpComponent implements OnInit {
  @Input()
  currentField: string;
  
  constructor() { }

  ngOnInit() {
  }

}
