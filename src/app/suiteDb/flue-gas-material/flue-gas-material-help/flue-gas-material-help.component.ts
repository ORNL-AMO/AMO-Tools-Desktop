import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-flue-gas-material-help',
    templateUrl: './flue-gas-material-help.component.html',
    styleUrls: ['./flue-gas-material-help.component.css'],
    standalone: false
})
export class FlueGasMaterialHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
