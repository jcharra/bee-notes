import { Pipe, PipeTransform } from '@angular/core';

export class TranslateServiceMock {
  setDefaultLang: (name: string) => {};
}

@Pipe({name: 'translate'})
export class MockTranslatePipe implements PipeTransform {
    transform(value: string): string {
        return value;
    }
}