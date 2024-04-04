import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FloorDbService {
  constructor(private prisma: PrismaService) { }

  async getAllFloorCollectionAlerts(): Promise<{ aId: string; userId: string; collectionId: string; latestFloor: number; timeStamp: string }[]> {
    const alerts = await this.prisma.floorAlerts.findMany();
    return alerts.map(alert => ({
      aId: alert.aId,
      userId: alert.uId,
      collectionId: alert.collectionId,
      latestFloor: alert.latestFloor,
      timeStamp: alert.timeStamp
    }));
  }

  async getUserByUserId(userId: string) {
    return this.prisma.user.findUnique({
      where: { uId: userId },
    });
  }

  async updateLatestFloors(
    alertCollections: { aId: string; userId: string; collectionId: string; latestFloor: number; }[],
    latestFloorPrices: Record<string, number>,
    deltaCollections: { collectionId: string; delta: number; }[]
  ): Promise<void> {
    const deltaCollectionIds = deltaCollections.map(dc => dc.collectionId);
    for (const alertCollection of alertCollections) {
      if (deltaCollectionIds.includes(alertCollection.collectionId)) {
        const latestFloor = latestFloorPrices[alertCollection.collectionId];
        if (latestFloor !== undefined) {
          await this.prisma.floorAlerts.update({
            where: { aId: alertCollection.aId },
            data: {
              latestFloor,
              timeStamp: new Date().toISOString()
            },
          });
        }
      }
    }
  }
  async getCollectionById(collectionId: string) {
    return this.prisma.collection.findUnique({
      where: { cId: collectionId },
    });
  }
}