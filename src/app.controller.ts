import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ConsistentHashing } from './utils/consistent-hashing.util';
import { CommonApiHelper } from './services/common-api-helper.lib';

@Controller()
export class AppController {
  private servers: any[] = [];
  private hasher: any;
  constructor(
    private readonly appService: AppService,
    private readonly commonApiHelper: CommonApiHelper,
  ) {
    let serverNames: string[] = process.env.SERVER_NAME?.split(',') || [];
    let serverHosts: string[] = process.env.SERVER_HOST?.split(',') || [];
    for (let i = 0; i < serverNames.length; i++) {
      this.servers.push({ name: serverNames[i], ip: serverHosts[i] });
    }
    this.hasher = new ConsistentHashing(this.servers, 3);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('*')
  async getServerToSendRequestViaCpuUsage(
    @Param() endpoint: { path: string[] },
    @Body() body: any,
  ) {
    const statusPromises = this.servers.map((server) =>
      this.commonApiHelper.getData(
        {
          method: 'GET',
          endpoint: server.ip + '/status',
        },
        {},
      ),
    );

    const results = await Promise.allSettled(statusPromises);

    let lowestCpuIndex = 0;
    let lowestCpuUsage = Infinity;

    results.forEach((result: any, index) => {
      if (result.status === 'fulfilled') {
        const usage = result.value?.cpuUsage;

        if (usage < lowestCpuUsage) {
          lowestCpuUsage = usage;
          lowestCpuIndex = index;
        }
      } else {
        console.error('Error fetching status from server:', result.reason);
      }
    });

    return this.commonApiHelper.postData(
      {
        endpoint:
          this.servers[lowestCpuIndex].ip + '/' + endpoint.path.join('/'),
      },
      body,
    );
  }

  @Get('*')
  async getServerToSendRequestViaHash(@Param() endpoint: { path: string[] }) {
    const server = this.hasher.getServer(endpoint.path.join('/'));
    const longUrl = await this.commonApiHelper.fetchData(
      { endpoint: server.ip + endpoint.path.join('/'), method: 'GET' },
      {},
    );
    return {
      ...server,
      longUrl
    };
  }
}
