import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyAr',
  standalone: true
})
export class CurrencyArPipe implements PipeTransform {
  transform(value: number): string {
    return `$ ${value.toFixed(2)}`;
  }
} 