import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { SettingsService } from '../../settings/settings.service';
import { Settings } from '../models/settings';

@Component({
  selector: 'app-update-units-modal',
  templateUrl: './update-units-modal.component.html',
  styleUrls: ['./update-units-modal.component.css']
})
export class UpdateUnitsModalComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  assessmentType: string;
  @Output('emitShouldUpdateData')
  emitShouldUpdateData = new EventEmitter<boolean>();
  showSuccessMessage: boolean = false;

  @ViewChild('updateUnitsModal', { static: false }) public updateUnitsModal: ModalDirective;

  constructor(private settingsService: SettingsService) { }

  ngOnInit() {
    this.settingsService.updateUnitsModalOpen.next(true);
  }

  ngAfterViewInit() {
    this.updateUnitsModal.show();
  }
  
  updateData() {
    this.showSuccessMessage = true;
    setTimeout(()=> {
      this.closeModal();
    }, 2000);
  }
  
  closeModal() {
    let shouldUpdateData = this.showSuccessMessage? true : false;
    this.showSuccessMessage = false;
    this.updateUnitsModal.hide();
    this.settingsService.updateUnitsModalOpen.next(false);
    this.updateUnitsModal.onHidden.subscribe(() => {
      this.emitShouldUpdateData.emit(shouldUpdateData);
    });
  }

}
