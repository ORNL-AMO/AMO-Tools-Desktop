import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-specific-speed-help',
    templateUrl: './specific-speed-help.component.html',
    styleUrls: ['./specific-speed-help.component.css'],
    standalone: false
})
export class SpecificSpeedHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}
