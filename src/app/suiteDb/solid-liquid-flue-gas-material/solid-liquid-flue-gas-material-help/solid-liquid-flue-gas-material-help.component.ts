import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-solid-liquid-flue-gas-material-help',
  templateUrl: './solid-liquid-flue-gas-material-help.component.html',
  styleUrls: ['./solid-liquid-flue-gas-material-help.component.css']
})
export class SolidLiquidFlueGasMaterialHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
