import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-gas-load-charge-material-help',
    templateUrl: './gas-load-charge-material-help.component.html',
    styleUrls: ['./gas-load-charge-material-help.component.css'],
    standalone: false
})
export class GasLoadChargeMaterialHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }
}
