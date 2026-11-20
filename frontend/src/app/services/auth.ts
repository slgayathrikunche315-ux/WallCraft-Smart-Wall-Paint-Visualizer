import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private apiUrl = 'https://wallcraft-smart-wall-paint-visualizer.onrender.com/api/auth';
private designApiUrl = 'https://wallcraft-smart-wall-paint-visualizer.onrender.com/api/designs';

  constructor(private http: HttpClient) {}

  // SIGNUP
  signup(userData: {
    name: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }

  // LOGIN
  login(userData: {
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/login`,
      userData
    ).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      })
    );
  }

  // FORGOT PASSWORD
  forgotPassword(email: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/forgot-password`,
      { email }
    );
  }

  // RESET PASSWORD
  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/reset-password/${token}`,
      { password }
    );
  }

  // SAVE DESIGN
  saveDesign(designData: {
    designName: string;
    originalImage: string;
    paintedImage: string;
    selectedColor: string;
  }): Observable<any> {

    const token = localStorage.getItem('token');

    return this.http.post(
      `${this.designApiUrl}/save`,
      designData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }

  // GET MY DESIGNS WITH SEARCH AND FILTER
  getMyDesigns(filters?: {
    search?: string;
    color?: string;
    favorite?: boolean;
  }): Observable<any> {

    const token = localStorage.getItem('token');

    let params = new HttpParams();

    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    if (filters?.color) {
      params = params.set('color', filters.color);
    }

    if (filters?.favorite !== undefined) {
      params = params.set('favorite', filters.favorite.toString());
    }

    return this.http.get(
      `${this.designApiUrl}/my-designs`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params
      }
    );
  }

  // DELETE DESIGN
  deleteDesign(id: string): Observable<any> {

    const token = localStorage.getItem('token');

    return this.http.delete(
      `${this.designApiUrl}/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }

  // RENAME DESIGN
  renameDesign(id: string, designName: string): Observable<any> {

    const token = localStorage.getItem('token');

    return this.http.patch(
      `${this.designApiUrl}/${id}/rename`,
      { designName },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }

  // ADD OR REMOVE FAVORITE
  toggleFavorite(id: string, isFavorite: boolean): Observable<any> {

    const token = localStorage.getItem('token');

    return this.http.patch(
      `${this.designApiUrl}/${id}/favorite`,
      { isFavorite },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }

  // GET SINGLE DESIGN
  getDesignById(id: string): Observable<any> {

    const token = localStorage.getItem('token');

    return this.http.get(
      `${this.designApiUrl}/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }

  // LOGOUT
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // CHECK LOGIN STATUS
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

}