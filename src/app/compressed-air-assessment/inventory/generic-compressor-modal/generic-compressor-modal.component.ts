import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { GenericCompressorDbService } from '../../generic-compressor-db.service';

@Component({
    selector: 'app-generic-compressor-modal',
    templateUrl: './generic-compressor-modal.component.html',
    styleUrls: ['./generic-compressor-modal.component.css'],
    standalone: false
})
export class GenericCompressorModalComponent implements OnInit {
  @Output('emitClose')
  emitClose = new EventEmitter<boolean>();

  @ViewChild('compressorModal', { static: false }) public compressorModal: ModalDirective;

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private genericCompressorDbService: GenericCompressorDbService,) { }

  ngOnInit() {
    let settings: Settings = this.compressedAirAssessmentService.settings.getValue();
    this.genericCompressorDbService.getAllCompressors(settings);
    this.compressedAirAssessmentService.modalOpen.next(true);
  }

  ngAfterViewInit() {
    this.compressorModal.show();
  }

  close() {
    this.compressorModal.hide();
    this.compressedAirAssessmentService.modalOpen.next(false);
    this.compressorModal.onHidden.subscribe(() => {
      this.emitClose.emit(true);
    });
  }
}
