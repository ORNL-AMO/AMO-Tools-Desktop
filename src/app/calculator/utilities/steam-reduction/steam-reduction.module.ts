import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SteamReductionComponent } from './steam-reduction.component';
import { SteamReductionResultsComponent } from './steam-reduction-results/steam-reduction-results.component';
import { SteamReductionFormComponent } from './steam-reduction-form/steam-reduction-form.component';
import { SteamReductionHelpComponent } from './steam-reduction-help/steam-reduction-help.component';

@NgModule({
  declarations: [SteamReductionComponent, SteamReductionResultsComponent, SteamReductionFormComponent, SteamReductionHelpComponent],
  imports: [
    CommonModule
  ]
})
export class SteamReductionModule { }
