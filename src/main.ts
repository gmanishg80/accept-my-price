import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';


const localtunnel = require('localtunnel');

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: '*', // Allow all origins, adjust this as needed
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    // allowedHeaders: 'Content-Type, Authorization',
  });

  // console.log(join(__dirname, '../..', 'views'), 'ppppppppppppppppppppp=====')
  app.setBaseViewsDir(join(__dirname, '../..', 'views'));
  app.setViewEngine('ejs');
  
  app.use(morgan('dev'));
  app.useGlobalPipes(new ValidationPipe());

  // app.use((req, res, next) => {
  //   if (req.url === '/user/confirm-payment-intent') {
  //     console.log("ksfdgjfkldgjfdlk")
  //     // Skip json middleware for the stripe subscription webhook
  //     next();
  //   }
  // });

  const config = new DocumentBuilder()
    .setTitle('Accept My Price Apis')
    .setDescription('I will add the description later...')
    .setVersion('1.0')
    .addTag('Accept My Price')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        // bearerFormat: 'JWT', // Optional, can be "JWT" or other custom token format
      },
      // 'access-token', // This name can be referenced in @ApiBearerAuth()
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // (async () => {
  //   const tunnel = await localtunnel({ port: 3000, subdomain: "acceptmyprice" });
  //   console.log(tunnel.url, '-----------------------');

  //   tunnel.on('close', () => {
  //   });
  // })();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
