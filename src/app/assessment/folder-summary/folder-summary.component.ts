import { Component, OnInit, Input, ViewChild, SimpleChanges } from '@angular/core';
import { Directory } from '../../shared/models/directory';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { Settings } from '../../shared/models/settings';
import { SettingsService } from '../../settings/settings.service';

@Component({
  selector: 'app-folder-summary',
  templateUrl: './folder-summary.component.html',
  styleUrls: ['./folder-summary.component.css']
})
export class FolderSummaryComponent implements OnInit {
  @Input()
  directory: Directory;
  constructor() { }

  ngOnInit() {
  }

}
