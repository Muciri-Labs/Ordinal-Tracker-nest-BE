import { Test, TestingModule } from '@nestjs/testing';
import { WalletAlertsControllerController } from './wallet-alerts-controller.controller';

describe('WalletAlertsControllerController', () => {
  let controller: WalletAlertsControllerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletAlertsControllerController],
    }).compile();

    controller = module.get<WalletAlertsControllerController>(WalletAlertsControllerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
