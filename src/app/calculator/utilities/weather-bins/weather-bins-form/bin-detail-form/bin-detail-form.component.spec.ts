import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BinDetailFormComponent } from './bin-detail-form.component';

describe('BinDetailFormComponent', () => {
  let component: BinDetailFormComponent;
  let fixture: ComponentFixture<BinDetailFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BinDetailFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BinDetailFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
