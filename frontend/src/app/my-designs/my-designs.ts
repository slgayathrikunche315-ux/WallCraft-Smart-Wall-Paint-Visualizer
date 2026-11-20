import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-my-designs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './my-designs.html',
  styleUrl: './my-designs.css'
})
export class MyDesigns implements OnInit {

  designs: any[] = [];

  loading = true;
  errorMessage = '';

  searchText = '';
  selectedColor = '';
  showFavoritesOnly = false;

  selectedDesign: any = null;

  constructor(private auth: Auth) {}

  ngOnInit(): void {
    this.loadMyDesigns();
  }

  // LOAD DESIGNS
  loadMyDesigns(): void {

    this.loading = true;
    this.errorMessage = '';

    this.auth.getMyDesigns({
      search: this.searchText,
      color: this.selectedColor,
      favorite: this.showFavoritesOnly ? true : undefined
    }).subscribe({

      next: (response: any) => {
        this.designs = response;
        this.loading = false;
      },

      error: (error) => {
        console.error('Fetch Designs Error:', error);

        this.errorMessage =
          error.error?.message || 'Unable to load your designs.';

        this.loading = false;
      }

    });
  }

  // SEARCH DESIGNS
  searchDesigns(): void {
    this.loadMyDesigns();
  }

  // FILTER BY COLOR
  filterByColor(): void {
    this.loadMyDesigns();
  }

  // SHOW FAVORITES
  toggleFavoritesFilter(): void {
    this.showFavoritesOnly = !this.showFavoritesOnly;
    this.loadMyDesigns();
  }

  // DELETE DESIGN
  deleteDesign(id: string): void {

    const confirmDelete = confirm(
      'Are you sure you want to delete this design?'
    );

    if (!confirmDelete) return;

    this.auth.deleteDesign(id).subscribe({

      next: () => {
        alert('Design deleted successfully!');
        this.loadMyDesigns();
      },

      error: (error) => {
        console.error('Delete Error:', error);
        alert(error.error?.message || 'Unable to delete design.');
      }

    });
  }

  // RENAME DESIGN
  renameDesign(id: string, currentName: string): void {

    const newName = prompt('Enter new design name:', currentName);

    if (newName === null || !newName.trim()) return;

    this.auth.renameDesign(id, newName.trim()).subscribe({

      next: () => {
        alert('Design renamed successfully!');
        this.loadMyDesigns();
      },

      error: (error) => {
        console.error('Rename Error:', error);
        alert(error.error?.message || 'Unable to rename design.');
      }

    });
  }

  // ADD OR REMOVE FAVORITE
  toggleFavorite(design: any): void {

    const newStatus = !design.isFavorite;

    this.auth.toggleFavorite(
      design._id,
      newStatus
    ).subscribe({

      next: () => {
        design.isFavorite = newStatus;

        if (this.showFavoritesOnly && !newStatus) {
          this.loadMyDesigns();
        }
      },

      error: (error) => {
        console.error('Favorite Error:', error);
        alert(error.error?.message || 'Unable to update favorite.');
      }

    });
  }

  // VIEW DESIGN
  viewDesign(design: any): void {
    this.selectedDesign = design;
  }

  // CLOSE DESIGN VIEW
  closeDesignView(): void {
    this.selectedDesign = null;
  }

}