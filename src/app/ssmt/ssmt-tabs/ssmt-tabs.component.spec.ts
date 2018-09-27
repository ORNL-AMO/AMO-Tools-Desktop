import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsmtTabsComponent } from './ssmt-tabs.component';

describe('SsmtTabsComponent', () => {
  let component: SsmtTabsComponent;
  let fixture: ComponentFixture<SsmtTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsmtTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsmtTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
