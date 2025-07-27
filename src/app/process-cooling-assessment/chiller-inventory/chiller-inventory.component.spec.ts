import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChillerInventoryComponent } from './chiller-inventory.component';

describe('ChillerInventoryComponent', () => {
  let component: ChillerInventoryComponent;
  let fixture: ComponentFixture<ChillerInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChillerInventoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChillerInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
