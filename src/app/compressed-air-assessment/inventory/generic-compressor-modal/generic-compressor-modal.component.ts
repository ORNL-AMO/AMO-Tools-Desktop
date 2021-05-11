import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';

@Component({
  selector: 'app-generic-compressor-modal',
  templateUrl: './generic-compressor-modal.component.html',
  styleUrls: ['./generic-compressor-modal.component.css']
})
export class GenericCompressorModalComponent implements OnInit {
  @Output('emitClose')
  emitClose = new EventEmitter<boolean>();

  @ViewChild('compressorModal', { static: false }) public compressorModal: ModalDirective;

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit() {
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
