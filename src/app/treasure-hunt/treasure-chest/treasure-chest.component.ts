import { Component, OnInit, Input } from '@angular/core';
import { TreasureHunt } from '../../shared/models/treasure-hunt';
import { Settings } from 'http2';

@Component({
  selector: 'app-treasure-chest',
  templateUrl: './treasure-chest.component.html',
  styleUrls: ['./treasure-chest.component.css']
})
export class TreasureChestComponent implements OnInit {
  @Input()
  treasureHunt: TreasureHunt;
  @Input()
  settings: Settings;
  
  constructor() { }

  ngOnInit() {
  }

}
