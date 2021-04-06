import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateUnitsModalComponent } from './update-units-modal.component';

describe('UpdateUnitsModalComponent', () => {
  let component: UpdateUnitsModalComponent;
  let fixture: ComponentFixture<UpdateUnitsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateUnitsModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateUnitsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
