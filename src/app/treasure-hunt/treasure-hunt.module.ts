import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreasureHuntComponent } from './treasure-hunt.component';
import { TreasureHuntBannerComponent } from './treasure-hunt-banner/treasure-hunt-banner.component';
import { FindTreasureComponent } from './find-treasure/find-treasure.component';
import { TreasureHuntService } from './treasure-hunt.service';
import { LightingReplacementModule } from '../calculator/lighting/lighting-replacement/lighting-replacement.module';

@NgModule({
  imports: [
    CommonModule,
    LightingReplacementModule
  ],
  declarations: [TreasureHuntComponent, TreasureHuntBannerComponent, FindTreasureComponent],
  providers: [ TreasureHuntService ]
})
export class TreasureHuntModule { }
