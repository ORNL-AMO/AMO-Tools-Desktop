import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImproveEndUseEfficiencyComponent } from './improve-end-use-efficiency.component';

describe('ImproveEndUseEfficiencyComponent', () => {
  let component: ImproveEndUseEfficiencyComponent;
  let fixture: ComponentFixture<ImproveEndUseEfficiencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImproveEndUseEfficiencyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImproveEndUseEfficiencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
