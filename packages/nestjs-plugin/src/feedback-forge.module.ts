import { DynamicModule, Module } from '@nestjs/common';
import { FeedbackController } from './controllers/feedback.controller.js';
import { FeedbackService } from './services/feedback.service.js';
import type { NestJSFeedbackForgeConfig } from './interfaces/feedback-forge-config.interface.js';

@Module({})
export class FeedbackForgeModule {
  static forRoot(config: NestJSFeedbackForgeConfig): DynamicModule {
    return {
      module: FeedbackForgeModule,
      controllers: [FeedbackController],
      providers: [
        {
          provide: 'FEEDBACK_FORGE_CONFIG',
          useValue: config,
        },
        FeedbackService,
      ],
      exports: [FeedbackService],
      global: false,
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<NestJSFeedbackForgeConfig> | NestJSFeedbackForgeConfig;
    inject?: any[];
  }): DynamicModule {
    return {
      module: FeedbackForgeModule,
      controllers: [FeedbackController],
      providers: [
        {
          provide: 'FEEDBACK_FORGE_CONFIG',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        FeedbackService,
      ],
      exports: [FeedbackService],
      global: false,
    };
  }
}
