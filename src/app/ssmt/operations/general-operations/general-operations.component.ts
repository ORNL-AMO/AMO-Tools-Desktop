import { Component, OnInit, Input } from '@angular/core';
import { GeneralSteamOperations } from '../../../shared/models/ssmt';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-general-operations',
  templateUrl: './general-operations.component.html',
  styleUrls: ['./general-operations.component.css']
})
export class GeneralOperationsComponent implements OnInit {
  @Input()
  generalSteamOperations: GeneralSteamOperations;
  @Input()
  settings: Settings;

  constructor() { }

  ngOnInit() {
  }

  save(){
    
  }
}
