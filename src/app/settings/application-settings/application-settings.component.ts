import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../settings.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';

@Component({
  selector: 'app-application-settings',
  templateUrl: './application-settings.component.html',
  styleUrls: ['./application-settings.component.css']
})
export class ApplicationSettingsComponent implements OnInit {

  settingsForm: any;

  languages: Array<string> = [
    'English'
  ];

  currencies: Array<string> = [
    'US Dollar'
  ]

  constructor(private settingsService: SettingsService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    this.settingsForm = this.settingsService.getSettingsForm();
  }

}
