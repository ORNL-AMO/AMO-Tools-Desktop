import { Component, OnInit, Input } from '@angular/core';
import { NameplateData, NameplateDataOptions } from '../../../../motor-inventory';
import { Settings } from '../../../../../shared/models/settings';

@Component({
    selector: 'app-nameplate-details',
    templateUrl: './nameplate-details.component.html',
    styleUrls: ['./nameplate-details.component.css'],
    standalone: false
})
export class NameplateDetailsComponent implements OnInit {
  @Input()
  nameplateData: NameplateData;
  @Input()
  displayOptions: NameplateDataOptions;
  @Input()
  settings: Settings;
  
  constructor() { }

  ngOnInit(): void {
  }

}
