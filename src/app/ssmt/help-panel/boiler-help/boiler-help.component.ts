import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-boiler-help',
  templateUrl: './boiler-help.component.html',
  styleUrls: ['./boiler-help.component.css']
})
export class BoilerHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
