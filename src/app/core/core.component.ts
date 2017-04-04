import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.css']
})

export class CoreComponent implements OnInit {
  updateAvailable: boolean = false;

  constructor(private ElectronService: ElectronService) { }

  ngOnInit() {
    this.ElectronService.ipcRenderer.send('ready', null);
    this.ElectronService.ipcRenderer.on('available', (event, arg) => {
      this.updateAvailable = arg;
    });
    console.log(this.updateAvailable);
  }
}
