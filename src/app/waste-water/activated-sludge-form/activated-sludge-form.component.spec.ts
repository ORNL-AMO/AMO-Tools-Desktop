import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivatedSludgeFormComponent } from './activated-sludge-form.component';

describe('ActivatedSludgeFormComponent', () => {
  let component: ActivatedSludgeFormComponent;
  let fixture: ComponentFixture<ActivatedSludgeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActivatedSludgeFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivatedSludgeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
