import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-designed-energy-steam-help',
  templateUrl: './designed-energy-steam-help.component.html',
  styleUrls: ['./designed-energy-steam-help.component.css']
})
export class DesignedEnergySteamHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  inPreAssessment: boolean;
  @Input()
  showSteam: boolean;
  @Input()
  showElectricity: boolean;
  @Input()
  showFuel: boolean;

  constructor() { }

  ngOnInit() {
  }
}
