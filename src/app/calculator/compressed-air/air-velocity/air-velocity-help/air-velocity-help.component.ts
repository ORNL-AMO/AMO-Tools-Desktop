import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-air-velocity-help',
  templateUrl: './air-velocity-help.component.html',
  styleUrls: ['./air-velocity-help.component.css'],
  standalone: false
})
export class AirVelocityHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  settings: Settings;
  docsLink: string = environment.measurDocsUrl;

  constructor() { }

  ngOnInit() {
  }

}
