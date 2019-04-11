import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Directory } from '../../../shared/models/directory';
import { Settings } from '../../../shared/models/settings';
import { ModalDirective } from 'ngx-bootstrap';
import { LightingReplacementService } from '../../../calculator/lighting/lighting-replacement/lighting-replacement.service';
import { LightingReplacementData } from '../../../shared/models/lighting';
import { LightingReplacementTreasureHunt } from '../../../shared/models/treasure-hunt';

@Component({
  selector: 'app-treasure-hunt-card',
  templateUrl: './treasure-hunt-card.component.html',
  styleUrls: ['./treasure-hunt-card.component.css', '../assessment-grid-view.component.css']
})
export class TreasureHuntCardComponent implements OnInit {
  @Input()
  directory: Directory;
  @Input()
  settings: Settings;


  @ViewChild('newItemModal') public newItemModal: ModalDirective;
  treasureHuntExists: boolean;
  constructor(
    private lightingReplacementService: LightingReplacementService
  ) { }

  ngOnInit() {
    if(!this.directory.treasureHunt){
      this.directory.treasureHunt = {
        name: this.directory.name + ' Treasure Hunt'
      }
    }else{
      this.treasureHuntExists = true;
    }
  }
}
