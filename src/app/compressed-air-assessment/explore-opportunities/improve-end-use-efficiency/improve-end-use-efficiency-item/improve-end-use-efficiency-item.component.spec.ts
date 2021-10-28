import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImproveEndUseEfficiencyItemComponent } from './improve-end-use-efficiency-item.component';

describe('ImproveEndUseEfficiencyItemComponent', () => {
  let component: ImproveEndUseEfficiencyItemComponent;
  let fixture: ComponentFixture<ImproveEndUseEfficiencyItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImproveEndUseEfficiencyItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImproveEndUseEfficiencyItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
