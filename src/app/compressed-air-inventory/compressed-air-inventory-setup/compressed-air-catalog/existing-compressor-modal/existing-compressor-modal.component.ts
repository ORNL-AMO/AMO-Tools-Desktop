import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CompressedAirInventoryService } from '../../../compressed-air-inventory.service';
import { Settings } from '../../../../shared/models/settings';
import { GenericCompressorDbService } from '../../../../shared/generic-compressor-db.service';

@Component({
  selector: 'app-existing-compressor-modal',
  templateUrl: './existing-compressor-modal.component.html',
  styleUrl: './existing-compressor-modal.component.css',
  standalone: false
})
export class ExistingCompressorModalComponent implements OnInit {
  @Output('emitClose')
  emitClose = new EventEmitter<boolean>();

  @ViewChild('compressorModal', { static: false }) public compressorModal: ModalDirective;


  constructor(private compressedAirInventoryService: CompressedAirInventoryService, private genericCompressorDbService: GenericCompressorDbService) { }



  ngOnInit() {
    let settings: Settings = this.compressedAirInventoryService.settings.getValue();
    this.genericCompressorDbService.getAllCompressors(settings);
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
