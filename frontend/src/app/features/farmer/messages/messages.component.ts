import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="messages-container">
      <h2>Messages</h2>
      <p>Communicate with customers and manage inquiries.</p>

      <div class="placeholder-content">
        <p>Your messages will be displayed here.</p>
      </div>
    </div>
  `,
  styles: [
    `
      .messages-container {
        padding: 1rem 0;
      }
      .placeholder-content {
        background-color: #f0f0f0;
        border-radius: 8px;
        padding: 2rem;
        text-align: center;
        margin-top: 1rem;
      }
    `,
  ],
})
export class MessagesComponent {}
