import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter, Input } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ElectronService } from 'ngx-electron';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { firstValueFrom } from 'rxjs';
import { Settings } from '../shared/models/settings';

@Component({
  selector: 'app-update-toast',
  templateUrl: './update-toast.component.html',
  styleUrls: ['./update-toast.component.css'],
  animations: [
    trigger('toast', [
      state('show', style({
        top: '20px'
      })),
      transition('hide => show', animate('.5s ease-in')),
      transition('show => hide', animate('.5s ease-out'))
    ])
  ]
})
export class UpdateToastComponent implements OnInit {
  @Output('emitCloseToast')
  emitCloseToast = new EventEmitter<boolean>();
  @Input()
  info: any;


  error: any;

  showToast: string = 'hide';
  showReleaseNotesCard: string = 'hide';
  destroyToast: boolean = false;
  destroyReleaseNotesCard: boolean = false;
  releaseNotes: string;
  releaseName: string;
  downloadingUpdate: boolean = false;
  updateDownloaded: boolean = false;
  version: string;
  constructor(private electronService: ElectronService, private cd: ChangeDetectorRef, private settingsDbService: SettingsDbService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    this.releaseName = this.info.releaseName;
    this.releaseNotes = this.info.releaseNotes.substring(this.info.releaseNotes.indexOf('</h1>') + 5);
    this.version = this.info.version;

    this.electronService.ipcRenderer.once('update-downloaded', (event, args) => {
      this.updateDownloaded = true;
      this.cd.detectChanges();
    })

    this.electronService.ipcRenderer.once('error', (event, args) => {
      this.error = true;
      this.cd.detectChanges();
    })
  }

  ngAfterViewInit(){
    this.showToast = 'show';
    this.cd.detectChanges();
  }

  closeToast() {
    this.showToast = 'hide';
    this.cd.detectChanges();
    setTimeout(() => {
      this.destroyToast = true;
      this.emitCloseToast.emit(true);
    }, 500);
  }

  viewReleaseNotes() {
    this.destroyReleaseNotesCard = false;
    this.showReleaseNotesCard = 'show';
    this.cd.detectChanges();
  }

  closeReleaseNotes() {
    this.showReleaseNotesCard = 'hide';
    this.cd.detectChanges();
    setTimeout(() => {
      this.destroyReleaseNotesCard = true;
    }, 500);
  }

  async updateNow() {
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.updateWithObservable(this.settingsDbService.globalSettings))
    this.settingsDbService.setAll(updatedSettings);
    this.downloadingUpdate = true;
    this.cd.detectChanges();
    this.electronService.ipcRenderer.send('update', null);
    setTimeout(() => {
      this.error = true;
    }, 120000)
  }

  quitAndInstall() {
    this.electronService.ipcRenderer.send('quit-and-install');
  }
}
