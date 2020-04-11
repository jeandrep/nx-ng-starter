import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { GrpcApiController } from './controller/grpc-api.controller';
import { NXNGSTARTER_PACKAGE, grpcApiClientOptions } from './grpc-api-client.options';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: NXNGSTARTER_PACKAGE,
        ...grpcApiClientOptions,
      },
    ]),
  ],
  controllers: [GrpcApiController],
})
export class GrpcApiModule {}