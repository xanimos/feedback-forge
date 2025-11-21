import { Component, Input, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, throwError, Observable } from 'rxjs';

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

/**
 * Custom submission handler function type.
 * Receives the feedback payload and should return an Observable that completes on success.
 */
export type FeedbackSubmissionHandler = (
  payload: FeedbackSubmission,
) => Observable<any>;

@Component({
  selector: 'ff-feedback-widget',
  templateUrl: './feedback-widget.component.html',
  styleUrls: ['./feedback-widget.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class FeedbackWidgetComponent implements OnInit {
  /**
   * API URL for feedback submission. Required if submitHandler is not provided.
   */
  @Input() feedbackApiUrl?: string;

  /**
   * Custom submission handler. If provided, this will be used instead of the default HTTP POST.
   * Should return an Observable that completes on success or errors on failure.
   *
   * Example:
   * ```typescript
   * customSubmitHandler = (payload: FeedbackSubmission) => {
   *   return this.myCustomHttpService.submitFeedback(payload);
   * }
   * ```
   */
  @Input() submitHandler?: FeedbackSubmissionHandler;

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

    // Validate that either submitHandler or feedbackApiUrl is provided
    if (!this.submitHandler && !this.feedbackApiUrl) {
      this.error = 'Configuration error: Either submitHandler or feedbackApiUrl must be provided';
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

    // Use custom handler if provided, otherwise use default HTTP POST
    let submission$: Observable<any>;

    try {
      submission$ = this.submitHandler
        ? this.submitHandler(payload)
        : this.http.post(this.feedbackApiUrl!, payload);
    } catch (error) {
      this.error = 'Failed to submit feedback: ' + (error instanceof Error ? error.message : 'Unknown error');
      this.isSubmitting = false;
      return;
    }

    submission$
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.error = error.error?.message || 'Failed to submit feedback';
          this.isSubmitting = false;
          return throwError(() => error);
        }),
      )
      .subscribe({
        next: (response) => {
          this.success = true;
          this.isSubmitting = false;
          this.resetForm();
          setTimeout(() => {
            this.isOpen = false;
            this.success = false;
          }, 2000);
        },
        error: (err) => {
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
