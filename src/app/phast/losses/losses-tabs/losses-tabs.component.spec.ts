import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LossesTabsComponent } from './losses-tabs.component';

describe('LossesTabsComponent', () => {
  let component: LossesTabsComponent;
  let fixture: ComponentFixture<LossesTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LossesTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LossesTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
