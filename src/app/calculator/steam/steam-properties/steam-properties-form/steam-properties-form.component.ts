import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from "@angular/forms";
import { Settings } from "../../../../shared/models/settings";
import { SteamPropertiesOutput } from "../../../../shared/models/steam";

@Component({
  selector: 'app-steam-properties-form',
  templateUrl: './steam-properties-form.component.html',
  styleUrls: ['./steam-properties-form.component.css']
})
export class SteamPropertiesFormComponent implements OnInit {
  @Input()
  steamPropertiesForm: FormGroup;
  @Input()
  settings: Settings;

  steamPropertiesOutput: SteamPropertiesOutput;

  constructor() { }

  ngOnInit() {
    this.steamPropertiesOutput = {
      pressure: 0, temperature: 0, quality: 0, specificEnthalpy: 0, specificEntropy: 0, specificVolume: 0
    };
  }

}
