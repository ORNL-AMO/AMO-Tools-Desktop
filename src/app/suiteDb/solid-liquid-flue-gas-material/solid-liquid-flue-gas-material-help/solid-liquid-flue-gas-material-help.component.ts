import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-solid-liquid-flue-gas-material-help',
  templateUrl: './solid-liquid-flue-gas-material-help.component.html',
  styleUrls: ['./solid-liquid-flue-gas-material-help.component.css']
})
export class SolidLiquidFlueGasMaterialHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  settings: Settings;
    
  constructor() { }

  ngOnInit() {
  }

}
