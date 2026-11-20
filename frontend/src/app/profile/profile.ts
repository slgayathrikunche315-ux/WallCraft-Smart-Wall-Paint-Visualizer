import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  userName = '';
  userEmail = '';

  ngOnInit(): void {
    const userData = localStorage.getItem('user');

    if (userData) {
      const user = JSON.parse(userData);

      this.userName = user.name || 'User';
      this.userEmail = user.email || '';
    }
  }
}