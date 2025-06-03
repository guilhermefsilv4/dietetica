import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  private transformResponse<T>(data: any): T {
    if (Array.isArray(data)) {
      return data.map(item => this.transformSingleItem(item)) as unknown as T;
    }
    return this.transformSingleItem(data) as T;
  }

  private transformSingleItem(item: any): any {
    if (!item || typeof item !== 'object') return item;

    const transformed = { ...item };
    if ('image_url' in transformed) {
      transformed.imageUrl = transformed.image_url;
      delete transformed.image_url;
    }
    return transformed;
  }

  private transformRequest(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const transformed = { ...data };

    // Mapeamento de campos específicos
    if ('imageUrl' in transformed) {
      transformed.image_url = transformed.imageUrl;
      delete transformed.imageUrl;
    }
    if ('saleType' in transformed) {
      transformed.sale_type = transformed.saleType;
      delete transformed.saleType;
    }
    if ('minStock' in transformed) {
      transformed.min_stock = transformed.minStock;
      delete transformed.minStock;
    }

    // Remover campos que não existem no banco
    delete transformed.weightUnit;
    delete transformed.variants;
    delete transformed.hasVariants;
    delete transformed.createdAt;
    delete transformed.updatedAt;

    return transformed;
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/${endpoint}`));
      return this.transformResponse<T>(response);
    } catch (error) {
      console.error(`Erro ao fazer GET para ${endpoint}:`, error);
      throw error;
    }
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const transformedData = this.transformRequest(data);
      const response = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/${endpoint}`, transformedData));
      return this.transformResponse<T>(response);
    } catch (error) {
      console.error(`Erro ao fazer POST para ${endpoint}:`, error);
      throw error;
    }
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    try {
      const transformedData = this.transformRequest(data);
      const response = await firstValueFrom(this.http.put<any>(`${this.apiUrl}/${endpoint}`, transformedData));
      return this.transformResponse<T>(response);
    } catch (error) {
      console.error(`Erro ao fazer PUT para ${endpoint}:`, error);
      throw error;
    }
  }

  async delete(endpoint: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${endpoint}`));
    } catch (error) {
      console.error(`Erro ao fazer DELETE para ${endpoint}:`, error);
      throw error;
    }
  }
}
