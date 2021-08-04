import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-full-load-amps-help',
  templateUrl: './full-load-amps-help.component.html',
  styleUrls: ['./full-load-amps-help.component.css']
})
export class FullLoadAmpsHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}
