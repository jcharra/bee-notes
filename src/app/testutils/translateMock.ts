import { Pipe, PipeTransform } from '@angular/core';

export class TranslateServiceMock {
  setDefaultLang: (name: string) => void;
}

@Pipe({
    name: 'translate',
    standalone: false
})
export class MockTranslatePipe implements PipeTransform {
    transform(value: string): string {
        return value;
    }
}