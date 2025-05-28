import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KitchenRestroomComponent } from './kitchen-restroom.component';

describe('KitchenRestroomComponent', () => {
  let component: KitchenRestroomComponent;
  let fixture: ComponentFixture<KitchenRestroomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KitchenRestroomComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KitchenRestroomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
