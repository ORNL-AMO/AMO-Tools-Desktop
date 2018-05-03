import { Component, OnInit,Input } from '@angular/core';

@Component({
  selector: 'app-metered-steam-help',
  templateUrl: './metered-steam-help.component.html',
  styleUrls: ['./metered-steam-help.component.css']
})
export class MeteredSteamHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  inPreAssessment: boolean;
  constructor() { }

  ngOnInit() {
  }

}
