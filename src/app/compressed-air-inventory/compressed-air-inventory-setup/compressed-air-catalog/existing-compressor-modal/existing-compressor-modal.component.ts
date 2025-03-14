import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ExistingCompressorDbService } from '../../../existing-compressor-db.service';
import { CompressedAirInventoryService } from '../../../compressed-air-inventory.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-existing-compressor-modal',
  templateUrl: './existing-compressor-modal.component.html',
  styleUrl: './existing-compressor-modal.component.css'
})
export class ExistingCompressorModalComponent implements OnInit {
  @Output('emitClose')
  emitClose = new EventEmitter<boolean>();

  @ViewChild('compressorModal', { static: false }) public compressorModal: ModalDirective;


  constructor(private compressedAirInventoryService: CompressedAirInventoryService, private existingCompressorDbService: ExistingCompressorDbService) { }



  ngOnInit() {
    let settings: Settings = this.compressedAirInventoryService.settings.getValue();
    this.existingCompressorDbService.getAllCompressors(settings);
    this.compressedAirInventoryService.modalOpen.next(true);
  }

  ngAfterViewInit() {
    this.compressorModal.show();
  }

  close() {
    this.compressorModal.hide();
    this.compressedAirInventoryService.modalOpen.next(false);
    this.compressorModal.onHidden.subscribe(() => {
      this.emitClose.emit(true);
    });
  }

}
