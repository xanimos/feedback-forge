import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FeedbackWidgetComponent } from './feedback-widget.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    FeedbackWidgetComponent, // Standalone component
  ],
  exports: [FeedbackWidgetComponent],
})
export class FeedbackWidgetModule {}
