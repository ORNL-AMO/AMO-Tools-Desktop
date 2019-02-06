import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreasureHuntBannerComponent } from './treasure-hunt-banner.component';

describe('TreasureHuntBannerComponent', () => {
  let component: TreasureHuntBannerComponent;
  let fixture: ComponentFixture<TreasureHuntBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreasureHuntBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreasureHuntBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
