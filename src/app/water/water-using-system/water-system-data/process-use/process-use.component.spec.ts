import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessUseComponent } from './process-use.component';

describe('ProcessUseComponent', () => {
  let component: ProcessUseComponent;
  let fixture: ComponentFixture<ProcessUseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessUseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProcessUseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
