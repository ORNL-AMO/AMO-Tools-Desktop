import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveItemsComponent } from './move-items.component';

describe('MoveItemsComponent', () => {
  let component: MoveItemsComponent;
  let fixture: ComponentFixture<MoveItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoveItemsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
