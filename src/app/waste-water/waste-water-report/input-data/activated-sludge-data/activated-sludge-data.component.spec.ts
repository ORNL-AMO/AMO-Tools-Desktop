import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivatedSludgeDataComponent } from './activated-sludge-data.component';

describe('ActivatedSludgeDataComponent', () => {
  let component: ActivatedSludgeDataComponent;
  let fixture: ComponentFixture<ActivatedSludgeDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActivatedSludgeDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivatedSludgeDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
