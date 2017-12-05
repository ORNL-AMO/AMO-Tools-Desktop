import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { LossesService } from '../../losses.service';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'app-opening-losses-help',
  templateUrl: './opening-losses-help.component.html',
  styleUrls: ['./opening-losses-help.component.css']
})
export class OpeningLossesHelpComponent implements OnInit {
  @Input()
  currentField: string;

  @ViewChild('viewFactorModal') public viewFactorModal: ModalDirective;

  constructor(private lossesService: LossesService) { }

  ngOnInit() {
  }

  showViewFactor(){
    this.lossesService.modalOpen.next(true);
    this.viewFactorModal.show();
  }

  hideViewFactorModal(){
    this.lossesService.modalOpen.next(false);
    this.viewFactorModal.hide();
  }
}
