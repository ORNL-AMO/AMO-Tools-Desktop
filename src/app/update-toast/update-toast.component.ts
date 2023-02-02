import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter, Input } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { SettingsDbService } from '../indexedDb/settings-db.service';
 
import { firstValueFrom } from 'rxjs';
import { Settings } from '../shared/models/settings';
import { ElectronService, ReleaseData } from '../electron/electron.service';

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
  releaseData: ReleaseData


  error: any;

  showUpdateToast: string = 'hide';
  showReleaseNotesCard: string = 'hide';
  destroyToast: boolean = false;
  destroyReleaseNotesCard: boolean = false;
  releaseNotes: string;
  releaseName: string;
  downloadingUpdate: boolean = false;
  updateDownloaded: boolean = false;
  version: string;
  updateErrorSub: any;
  updateError: boolean;
  updateDownloadedSub: any;
  constructor(private electronService: ElectronService, private cd: ChangeDetectorRef, private settingsDbService: SettingsDbService,  ) { }

  ngOnInit() {
    this.releaseName = this.releaseData.releaseName;
    this.releaseNotes = this.releaseData.releaseNotes.substring(this.releaseData.releaseNotes.indexOf('</h1>') + 5);
    this.version = this.releaseData.version;

    this.updateDownloadedSub = this.electronService.updateDownloaded.subscribe(val => {
      this.updateDownloaded = val;
      this.cd.detectChanges();
    })

    
    this.updateErrorSub = this.electronService.updateError.subscribe(val => {
      this.updateError = val;
      if (this.updateError) {
        this.error = true;
        this.cd.detectChanges();
      }
    })
  }

  ngAfterViewInit(){
    this.showUpdateToast = 'show';
    this.cd.detectChanges();
  }

  closeToast() {
    this.showUpdateToast = 'hide';
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
    this.electronService.sendUpdateSignal();
    setTimeout(() => {
      this.error = true;
    }, 120000)
  }

  quitAndInstall() {
    this.electronService.sendQuitAndInstall();
  }
}
