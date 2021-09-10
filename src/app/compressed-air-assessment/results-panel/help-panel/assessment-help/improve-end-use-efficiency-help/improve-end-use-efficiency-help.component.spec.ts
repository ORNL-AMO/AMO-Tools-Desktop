import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImproveEndUseEfficiencyHelpComponent } from './improve-end-use-efficiency-help.component';

describe('ImproveEndUseEfficiencyHelpComponent', () => {
  let component: ImproveEndUseEfficiencyHelpComponent;
  let fixture: ComponentFixture<ImproveEndUseEfficiencyHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImproveEndUseEfficiencyHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImproveEndUseEfficiencyHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
