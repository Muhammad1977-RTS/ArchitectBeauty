import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class SnakeCaseInterceptor implements NestInterceptor {
    intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown>;
}
