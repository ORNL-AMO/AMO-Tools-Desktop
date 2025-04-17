import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-solid-load-charge-material-help',
    templateUrl: './solid-load-charge-material-help.component.html',
    styleUrls: ['./solid-load-charge-material-help.component.css'],
    standalone: false
})
export class SolidLoadChargeMaterialHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
