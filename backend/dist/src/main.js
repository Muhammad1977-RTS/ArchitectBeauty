"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const snake_case_interceptor_1 = require("./common/snake-case.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalInterceptors(new snake_case_interceptor_1.SnakeCaseInterceptor());
    app.enableCors({
        origin: ['http://localhost:4200'],
        credentials: true,
    });
    await app.listen(process.env.PORT ?? 3001);
    console.log(`Backend running on http://localhost:${process.env.PORT ?? 3001}`);
}
bootstrap();
//# sourceMappingURL=main.js.map