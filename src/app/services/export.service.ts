import { Injectable } from '@angular/core';
import { Product } from '@interfaces/product.interface';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface ExportProduct {
  CODIGO: string;
  NOMBRE: string;
  RUBRO: string;
  PROVEEDOR: string;
  'STOCK MINIMO': number;
  COSTO: number;
  PRECIO: number;
  'PRECIO X MAYOR': number;
  'MARKUP %': number;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  private mapProductToExport(product: Product): ExportProduct {
    return {
      CODIGO: product.barcode || '',
      NOMBRE: product.name || '',
      RUBRO: product.category || '',
      PROVEEDOR: product.brand || '', // No sistema, brand representa o provedor
      'STOCK MINIMO': product.minStock || 0,
      COSTO: 0, // Campo não existe no banco, então 0
      PRECIO: product.price || 0,
      'PRECIO X MAYOR': 0, // Campo não existe no banco, então 0
      'MARKUP %': 0 // Campo não existe no banco, então 0
    };
  }

  exportToCSV(products: Product[], filename: string = 'productos'): void {
    const exportData = products.map(product => this.mapProductToExport(product));

    // Criar worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Criar workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');

    // Gerar CSV
    const csvOutput = XLSX.write(workbook, { bookType: 'csv', type: 'array' });

    // Fazer download
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
  }

  exportToExcel(products: Product[], filename: string = 'productos'): void {
    const exportData = products.map(product => this.mapProductToExport(product));

    // Criar worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Ajustar largura das colunas
    const columnWidths = [
      { wch: 15 }, // CODIGO
      { wch: 30 }, // NOMBRE
      { wch: 20 }, // RUBRO
      { wch: 20 }, // MARCA
      { wch: 20 }, // PROVEEDOR
      { wch: 15 }, // STOCK MINIMO
      { wch: 10 }, // COSTO
      { wch: 10 }, // PRECIO
      { wch: 15 }, // PRECIO X MAYOR
      { wch: 10 }  // MARKUP %
    ];
    worksheet['!cols'] = columnWidths;

    // Criar workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');

    // Gerar Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Fazer download
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });
    saveAs(blob, `${filename}.xlsx`);
  }

  exportFilteredToCSV(products: Product[], filename: string = 'productos_filtrados'): void {
    this.exportToCSV(products, filename);
  }

  exportFilteredToExcel(products: Product[], filename: string = 'productos_filtrados'): void {
    this.exportToExcel(products, filename);
  }

  // Função para exportar template vazio (para importação)
  exportTemplate(format: 'csv' | 'excel' = 'csv'): void {
    const templateData: ExportProduct[] = [
      {
        CODIGO: '1234567890123',
        NOMBRE: 'Ejemplo Producto',
        RUBRO: 'Categoria Ejemplo',
        PROVEEDOR: 'Proveedor Ejemplo',
        'STOCK MINIMO': 10,
        COSTO: 50,
        PRECIO: 100,
        'PRECIO X MAYOR': 90,
        'MARKUP %': 100
      }
    ];

    if (format === 'csv') {
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

      const csvOutput = XLSX.write(workbook, { bookType: 'csv', type: 'array' });
      const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'template_productos.csv');
    } else {
      this.exportToExcel(templateData as any, 'template_productos');
    }
  }
}
