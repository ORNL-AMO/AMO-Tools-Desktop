import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddModificationComponent } from './add-modification.component';

describe('AddModificationComponent', () => {
  let component: AddModificationComponent;
  let fixture: ComponentFixture<AddModificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddModificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddModificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
