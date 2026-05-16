"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnakeCaseInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
function toSnake(str) {
    return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}
function transformKeys(obj) {
    if (Array.isArray(obj))
        return obj.map(transformKeys);
    if (obj && typeof obj === 'object' && !(obj instanceof Date)) {
        return Object.fromEntries(Object.entries(obj).map(([k, v]) => [toSnake(k), transformKeys(v)]));
    }
    return obj;
}
let SnakeCaseInterceptor = class SnakeCaseInterceptor {
    intercept(_ctx, next) {
        return next.handle().pipe((0, operators_1.map)(transformKeys));
    }
};
exports.SnakeCaseInterceptor = SnakeCaseInterceptor;
exports.SnakeCaseInterceptor = SnakeCaseInterceptor = __decorate([
    (0, common_1.Injectable)()
], SnakeCaseInterceptor);
//# sourceMappingURL=snake-case.interceptor.js.map