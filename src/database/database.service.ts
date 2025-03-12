import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Server } from 'net';
import { Client } from 'ssh2';
import net from 'net';


@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private sshTunnel: Server;
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
  ) {} // private configService: ConfigService

  async onModuleInit() {
    await this.createSSHTunnel({
      sshHost: 'ssh host url or ip address',
      sshPort: 11048,
      sshUser: 'shh username',
      privateKeyPath: '/home/username/.ssh/privatekey',
      passphrase: '',//if you set passphrase for your private key
      dbHost: 'db host url or ip address',
      dbPort: 5432,
    });
  }

  async onModuleDestroy() {
    if (this.sshTunnel) {
      this.logger.log('Closing SSH tunnel');
      this.sshTunnel.close();
    }
  }

  private async createSSHTunnel(config: {
    sshHost: string;
    sshPort: number;
    sshUser: string;
    privateKeyPath: string;
    passphrase: string;

    dbHost: string;
    dbPort: number;
  }): Promise<{ localPort: number }> {
    return new Promise((resolve, reject) => {
      const sshClient = new Client();
      sshClient.on('ready', () => {
        const server = net.createServer((socket) => {
          sshClient.forwardOut(
            socket.remoteAddress || '127.0.0.1',
            socket.remotePort || 0,
            config.dbHost,
            config.dbPort,
            (err, stream) => {
              if (err) {
                socket.destroy();
                reject(err);
                return;
              }
              socket.pipe(stream).pipe(socket);
            },
          );
        });

        server.listen(0, '127.0.0.1', function () {
          const localPort = (server.address() as net.AddressInfo).port;
          resolve({ localPort });
        });
      });
      sshClient.connect({
        host: config.sshHost,
        port: config.sshPort,
        username: config.sshUser,
        privateKey: require('fs').readFileSync(config.privateKeyPath),
        passphrase: config.passphrase,
      });
      sshClient.on('error', reject);
    });
  }
}
