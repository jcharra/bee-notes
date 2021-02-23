import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { JournalEditEntryPage } from './journal-edit-entry.page';

describe('JournalEditEntryPage', () => {
  let component: JournalEditEntryPage;
  let fixture: ComponentFixture<JournalEditEntryPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ JournalEditEntryPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(JournalEditEntryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
