import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FarmerSidebarComponent } from '../../../shared/components/farmer-sidebar/farmer-sidebar.component';

@Component({
  selector: 'app-farmer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FarmerSidebarComponent],
  templateUrl: './farmer-dashboard.component.html',
  styleUrls: ['./farmer-dashboard.component.scss'],
})
export class FarmerDashboardComponent {
  // Dashboard logic will go here
}
