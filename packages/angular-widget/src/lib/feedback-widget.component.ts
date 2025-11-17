import { Component, Input, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, throwError } from 'rxjs';

export interface FeedbackSubmission {
  title: string;
  feedback: string;
  breadcrumbs?: string;
  userId?: string | number;
}

export interface FeedbackWidgetStyles {
  button?: Partial<CSSStyleDeclaration>;
  formContainer?: Partial<CSSStyleDeclaration>;
  input?: Partial<CSSStyleDeclaration>;
  textarea?: Partial<CSSStyleDeclaration>;
  widgetContainer?: Partial<CSSStyleDeclaration>;
  closeButton?: Partial<CSSStyleDeclaration>;
}

@Component({
  selector: 'ff-feedback-widget',
  templateUrl: './feedback-widget.component.html',
  styleUrls: ['./feedback-widget.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class FeedbackWidgetComponent implements OnInit {
  @Input() feedbackApiUrl!: string;
  @Input() userId?: string | number;
  @Input() defaultTitle?: string = '';
  @Input() defaultFeedback?: string = '';
  @Input() defaultBreadcrumbs?: string = '';
  @Input() customStyles?: FeedbackWidgetStyles;

  isOpen = false;
  title = '';
  feedback = '';
  breadcrumbs = '';
  isSubmitting = false;
  error: string | null = null;
  success = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.title = this.defaultTitle || '';
    this.feedback = this.defaultFeedback || '';
    this.breadcrumbs = this.defaultBreadcrumbs || '';
  }

  toggleWidget(): void {
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.resetForm();
    }
  }

  submitFeedback(): void {
    if (!this.title || !this.feedback) {
      return;
    }

    this.isSubmitting = true;
    this.error = null;
    this.success = false;

    const payload: FeedbackSubmission = {
      title: this.title,
      feedback: this.feedback,
      breadcrumbs: this.breadcrumbs || 'Submitted via Angular widget',
      userId: this.userId,
    };

    this.http
      .post(this.feedbackApiUrl, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.error = error.error?.message || 'Failed to submit feedback';
          this.isSubmitting = false;
          return throwError(() => error);
        }),
      )
      .subscribe({
        next: () => {
          this.success = true;
          this.isSubmitting = false;
          this.resetForm();
          setTimeout(() => {
            this.isOpen = false;
            this.success = false;
          }, 2000);
        },
        error: () => {
          this.isSubmitting = false;
        },
      });
  }

  private resetForm(): void {
    this.title = '';
    this.feedback = '';
    this.breadcrumbs = '';
    this.error = null;
  }
}
