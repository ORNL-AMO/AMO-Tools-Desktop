import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatBannerComponent } from './fsat-banner.component';

describe('FsatBannerComponent', () => {
  let component: FsatBannerComponent;
  let fixture: ComponentFixture<FsatBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
