import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoverProcessUsageComponent } from './hover-process-usage.component';

describe('HoverProcessUsageComponent', () => {
  let component: HoverProcessUsageComponent;
  let fixture: ComponentFixture<HoverProcessUsageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoverProcessUsageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoverProcessUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
