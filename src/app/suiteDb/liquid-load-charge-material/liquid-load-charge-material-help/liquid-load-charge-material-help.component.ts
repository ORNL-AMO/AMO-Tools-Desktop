import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-liquid-load-charge-material-help',
    templateUrl: './liquid-load-charge-material-help.component.html',
    styleUrls: ['./liquid-load-charge-material-help.component.css'],
    standalone: false
})
export class LiquidLoadChargeMaterialHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
