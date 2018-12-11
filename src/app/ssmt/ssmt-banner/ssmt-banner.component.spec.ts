import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsmtBannerComponent } from './ssmt-banner.component';

describe('SsmtBannerComponent', () => {
  let component: SsmtBannerComponent;
  let fixture: ComponentFixture<SsmtBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsmtBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsmtBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
