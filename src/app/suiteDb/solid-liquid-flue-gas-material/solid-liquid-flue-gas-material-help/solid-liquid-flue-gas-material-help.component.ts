import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-solid-liquid-flue-gas-material-help',
    templateUrl: './solid-liquid-flue-gas-material-help.component.html',
    styleUrls: ['./solid-liquid-flue-gas-material-help.component.css'],
    standalone: false
})
export class SolidLiquidFlueGasMaterialHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  settings: Settings;
  
  docsLink: string = environment.measurDocsUrl;
    
  constructor() { }

  ngOnInit() {
  }

}
