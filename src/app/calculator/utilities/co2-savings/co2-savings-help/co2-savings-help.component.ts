import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-co2-savings-help',
    templateUrl: './co2-savings-help.component.html',
    styleUrls: ['./co2-savings-help.component.css'],
    standalone: false
})
export class Co2SavingsHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}
