import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { FormGroup } from '@angular/forms';
import { SettingsService } from '../../settings/settings.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { TreasureHunt } from '../../shared/models/treasure-hunt';
import { OperatingHours } from '../../shared/models/operations';
import { TreasureHuntService } from '../treasure-hunt.service';

@Component({
  selector: 'app-system-basics',
  templateUrl: './system-basics.component.html',
  styleUrls: ['./system-basics.component.css']
})
export class SystemBasicsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;
  @Output('updateSettings')
  updateSettings = new EventEmitter<boolean>();

  @ViewChild('formElement') formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  formWidth: number;
  showOperatingHoursModal: boolean = false;

  settingsForm: FormGroup;

  constructor(private settingsService: SettingsService, private indexedDbService: IndexedDbService, 
    private settingsDbService: SettingsDbService, private treasureHuntService: TreasureHuntService) { }

  ngOnInit() {
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
    this.assessment.treasureHunt.operatingHours
  }

  ngAfterViewInit(){
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100);
  }

  save(){
    let id: number = this.settings.id;
    this.settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    this.settings.id = id;
    this.settings.assessmentId = this.assessment.id;
    this.indexedDbService.putSettings(this.settings).then(
      results => {
        this.settingsDbService.setAll().then(() => {
          //get updated settings
          this.updateSettings.emit(true);
        })
      }
    )
  }

  saveTreasureHunt(){
    this.treasureHuntService.treasureHunt.next(this.assessment.treasureHunt);
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
    this.treasureHuntService.modalOpen.next(false);
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
    this.treasureHuntService.modalOpen.next(true);
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.assessment.treasureHunt.operatingHours = oppHours;
    this.saveTreasureHunt();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
