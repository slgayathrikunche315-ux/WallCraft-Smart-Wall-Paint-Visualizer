import {
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})

export class Dashboard {

  isSidebarOpen = false;
  userName = 'Guest User';

  totalDesigns = 0;
  favoriteDesigns = 0;
  colorsExplored = 0;

  recentDesigns: any[] = [];

  isLoadingDesigns = false;

  constructor(
    private auth: Auth,
    private router: Router
  ) {
    const user = localStorage.getItem('user');

    if (user) {
      this.userName = JSON.parse(user).name;
    }

    this.loadDashboardData();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
      this.router.navigate(['/login']);
    }
  }

  loadDashboardData(): void {

    this.isLoadingDesigns = true;

    this.auth.getMyDesigns().subscribe({

      next: (response: any) => {

        const designs = Array.isArray(response)
          ? response
          : response.designs || [];

        this.totalDesigns = designs.length;

        this.favoriteDesigns = designs.filter(
          (design: any) => design.isFavorite
        ).length;

        const uniqueColors = new Set(
          designs.map((design: any) => design.selectedColor)
        );

        this.colorsExplored = uniqueColors.size;

        this.recentDesigns = [...designs]
          .sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          )
          .slice(0, 3);

        this.isLoadingDesigns = false;
      },

      error: (error) => {
        console.error('Dashboard data error:', error);
        this.isLoadingDesigns = false;
      }

    });
  }

  viewMyDesigns(): void {
    this.router.navigate(['/my-designs']);
  }

  viewDesign(id: string): void {
    this.router.navigate(['/my-designs']);
  }

  uploadedImage: string | null = null;
  originalImage: string | null = null;
  paintedImage: string | null = null;

  @ViewChild('wallCanvas')
  wallCanvas!: ElementRef<HTMLCanvasElement>;

  private roomImage: HTMLImageElement | null = null;

  wallPoints: { x: number; y: number }[] = [];

  selectionClosed = false;
  showComparison = false;

  selectedColor = '#E9DCCB';

  colors = [
    { name: 'Soft Sand', code: '#E9DCCB' },
    { name: 'Sage Garden', code: '#C5D2C0' },
    { name: 'Warm Taupe', code: '#D6C3B3' },
    { name: 'Morning Mist', code: '#B9C9D8' },
    { name: 'Clay Blush', code: '#E5B9A8' },
    { name: 'Olive Whisper', code: '#D9D8C2' },
    { name: 'Ocean Breeze', code: '#AFCBD5' },
    { name: 'Lavender Dream', code: '#D0C2DC' },
    { name: 'Peach Cream', code: '#F0C9AD' },
    { name: 'Forest Sage', code: '#A9B9A0' },
    { name: 'Cloud White', code: '#F1F0E8' },
    { name: 'Dusty Rose', code: '#D9AFAF' }
  ];

  onImageSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please select JPG, PNG or WebP image.');
      input.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {

      const imageData = reader.result as string;
      const image = new Image();

      image.onload = () => {

        this.uploadedImage = imageData;
        this.originalImage = imageData;
        this.paintedImage = null;

        this.roomImage = image;
        this.wallPoints = [];

        this.selectionClosed = false;
        this.showComparison = false;

        setTimeout(() => this.initializeCanvas(), 100);
      };

      image.onerror = () => alert('Unable to load image.');

      image.src = imageData;
    };

    reader.onerror = () => alert('Unable to read image.');

    reader.readAsDataURL(file);
  }

  initializeCanvas(): void {

    if (!this.roomImage || !this.wallCanvas) return;

    const canvas = this.wallCanvas.nativeElement;

    canvas.width = this.roomImage.naturalWidth;
    canvas.height = this.roomImage.naturalHeight;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
      this.roomImage,
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  selectWallPoint(event: MouseEvent): void {

    if (this.selectionClosed || !this.wallCanvas) return;

    const canvas = this.wallCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    const x =
      (event.clientX - rect.left) * canvas.width / rect.width;

    const y =
      (event.clientY - rect.top) * canvas.height / rect.height;

    this.wallPoints.push({ x, y });

    this.paintedImage = null;
    this.showComparison = false;

    this.drawWallSelection();
  }

  drawWallSelection(): void {

    if (!this.wallCanvas || !this.roomImage) return;

    const canvas = this.wallCanvas.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(this.roomImage, 0, 0, canvas.width, canvas.height);

    if (this.wallPoints.length === 0) return;

    ctx.beginPath();

    ctx.moveTo(
      this.wallPoints[0].x,
      this.wallPoints[0].y
    );

    for (let i = 1; i < this.wallPoints.length; i++) {
      ctx.lineTo(
        this.wallPoints[i].x,
        this.wallPoints[i].y
      );
    }

    if (this.selectionClosed) {
      ctx.closePath();
      ctx.fillStyle = 'rgba(90, 150, 90, 0.25)';
      ctx.fill();
    }

    ctx.strokeStyle = '#00aaff';
    ctx.lineWidth = Math.max(3, canvas.width / 400);
    ctx.stroke();

    this.wallPoints.forEach(point => {

      ctx.beginPath();

      ctx.arc(
        point.x,
        point.y,
        Math.max(5, canvas.width / 250),
        0,
        Math.PI * 2
      );

      ctx.fillStyle = '#ff4444';
      ctx.fill();

    });
  }

  closeWallSelection(): void {

    if (this.wallPoints.length < 3) {
      alert('Please select at least 3 wall points.');
      return;
    }

    this.selectionClosed = true;

    this.drawWallSelection();
  }

  undoLastPoint(): void {

    if (this.wallPoints.length === 0) return;

    this.wallPoints.pop();

    this.selectionClosed = false;
    this.paintedImage = null;
    this.showComparison = false;

    this.drawWallSelection();
  }

  clearWallSelection(): void {

    this.wallPoints = [];

    this.selectionClosed = false;
    this.paintedImage = null;
    this.showComparison = false;

    this.initializeCanvas();
  }

  chooseColor(color: string): void {
    this.selectedColor = color;
  }

  onCustomColorChange(event: Event): void {

    const input = event.target as HTMLInputElement;

    this.selectedColor = input.value;
  }

  applyPaint(): void {

    if (!this.selectionClosed || this.wallPoints.length < 3) {
      alert('Please select a wall area first.');
      return;
    }

    if (!this.wallCanvas || !this.roomImage) return;

    const canvas = this.wallCanvas.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(this.roomImage, 0, 0, canvas.width, canvas.height);

    ctx.save();

    ctx.beginPath();

    ctx.moveTo(
      this.wallPoints[0].x,
      this.wallPoints[0].y
    );

    for (let i = 1; i < this.wallPoints.length; i++) {
      ctx.lineTo(
        this.wallPoints[i].x,
        this.wallPoints[i].y
      );
    }

    ctx.closePath();
    ctx.clip();

    ctx.globalCompositeOperation = 'color';
    ctx.globalAlpha = 0.78;

    ctx.fillStyle = this.selectedColor;

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = 0.25;

    ctx.fillStyle = this.selectedColor;

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    this.paintedImage = canvas.toDataURL('image/jpeg', 0.95);

    this.showComparison = true;
  }

  resetDesign(): void {

    this.wallPoints = [];

    this.selectionClosed = false;
    this.paintedImage = null;
    this.showComparison = false;

    this.initializeCanvas();
  }

  downloadDesign(): void {

    if (!this.paintedImage) {
      alert('Please apply paint before downloading.');
      return;
    }

    const link = document.createElement('a');

    link.href = this.paintedImage;
    link.download = 'WallCraft-My-Design.jpg';

    link.click();
  }

  saveDesign(): void {

    if (!this.originalImage || !this.paintedImage) {
      alert('Please apply paint before saving your design.');
      return;
    }

    this.auth.saveDesign({

      designName: 'My Wall Design',
      originalImage: this.originalImage,
      paintedImage: this.paintedImage,
      selectedColor: this.selectedColor

    }).subscribe({

      next: () => {

        alert('Design saved successfully!');

        this.loadDashboardData();
      },

      error: (error) => {

        console.error('Save Design Error:', error);

        alert(
          error.error?.message ||
          'Unable to save design. Please try again.'
        );
      }

    });
  }

}