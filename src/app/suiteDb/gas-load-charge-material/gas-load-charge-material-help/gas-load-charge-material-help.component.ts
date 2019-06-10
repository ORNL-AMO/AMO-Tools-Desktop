import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-gas-load-charge-material-help',
  templateUrl: './gas-load-charge-material-help.component.html',
  styleUrls: ['./gas-load-charge-material-help.component.css']
})
export class GasLoadChargeMaterialHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes.currentField');
    console.log(changes.currentField);
  }

}
