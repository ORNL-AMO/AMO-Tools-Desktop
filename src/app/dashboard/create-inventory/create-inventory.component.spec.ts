import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateInventoryComponent } from './create-inventory.component';

describe('CreateInventoryComponent', () => {
  let component: CreateInventoryComponent;
  let fixture: ComponentFixture<CreateInventoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateInventoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
