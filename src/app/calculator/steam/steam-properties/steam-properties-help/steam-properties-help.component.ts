import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-steam-properties-help',
  templateUrl: './steam-properties-help.component.html',
  styleUrls: ['./steam-properties-help.component.css']
})
export class SteamPropertiesHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}
