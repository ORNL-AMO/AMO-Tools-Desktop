import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CondensingEconomizerFormComponent } from './condensing-economizer-form.component';

describe('CondensingEconomizerFormComponent', () => {
  let component: CondensingEconomizerFormComponent;
  let fixture: ComponentFixture<CondensingEconomizerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CondensingEconomizerFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CondensingEconomizerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
