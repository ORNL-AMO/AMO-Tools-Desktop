import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';

this.updateAvailable = false;

@Component({
  selector: 'app-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.css']
})

export class CoreComponent implements OnInit {
  updateAvailable: boolean;

  constructor(private ElectronService: ElectronService) { }

  ngOnInit() {
    this.ElectronService.ipcRenderer.send('ready');
    this.ElectronService.ipcRenderer.on('available', (event) => {
      this.updateAvailable = true;
      console.log(event);
    });
  }
}
