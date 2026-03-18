import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-lighting-fixtures-material-help',
    templateUrl: './lighting-fixtures-material-help.component.html',
    styleUrls: ['./lighting-fixtures-material-help.component.css'],
    standalone: false
})
export class LightingFixturesMaterialHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
