import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-application-settings',
  templateUrl: './application-settings.component.html',
  styleUrls: ['./application-settings.component.css']
})
export class ApplicationSettingsComponent implements OnInit {
  @Input()
  settingsForm: any;

  languages: Array<string> = [
    'English'
  ];

  currencies: Array<string> = [
    '$ - US Dollar'
  ]

  constructor() { }

  ngOnInit() {

  }

}
