import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemBasicsForm } from './system-basics-form';

describe('SystemBasicsForm', () => {
  let component: SystemBasicsForm;
  let fixture: ComponentFixture<SystemBasicsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemBasicsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemBasicsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
