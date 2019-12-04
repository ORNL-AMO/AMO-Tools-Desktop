import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteItemsModalComponent } from './delete-items-modal.component';

describe('DeleteItemsModalComponent', () => {
  let component: DeleteItemsModalComponent;
  let fixture: ComponentFixture<DeleteItemsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteItemsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteItemsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
