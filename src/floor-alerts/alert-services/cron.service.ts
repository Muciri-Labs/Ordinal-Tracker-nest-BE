import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FloorDbService } from 'src/prisma-db/floors/floor.service';
import { FetchService } from '../simple-hash-services/fetch.service';
import { DeltaService } from './delta.service';
import { TelegramService } from '../telegram-services/send-alerts.service';

type DeltaCollection = {
    collectionId: string;
    delta: number;
};

@Injectable()
export class CronService {
    constructor(
        private readonly floorDbActions: FloorDbService,
        private readonly fetchService: FetchService,
        private readonly deltaService: DeltaService,
        private readonly telegramService: TelegramService,
    ) { }

    private readonly logger = new Logger(CronService.name);

    async onModuleInit() {
        await this.populateInitialData();
    }

    async populateInitialData() {
        this.logger.log('--------------------------------------------------------------------------------------------------------------\n\n\nPopulating initial data');

        //get all the user - collection entries that require alerting
        try {
            const alertCollections: {
                aId: string;
                userId: string;
                collectionId: string;
                latestFloor: number;
            }[] = await this.floorDbActions.getAllFloorCollectionAlerts();

            console.log('alertCollections: ', alertCollections, '\n\n');

            //extract collection ids
            const uniqueCollectionIds: string[] = Array.from(
                new Set(alertCollections.map((collection) => collection.collectionId)),
            );

            console.log('uniqueCollectionIds: ', uniqueCollectionIds, '\n\n');

            //call simple hash API to fetch latest collection floor details
            const latestFloorPrices: Record<string, number> = await this.fetchService.fetchCollectionsLatestFloorPrice(
                uniqueCollectionIds,
            );

            console.log('latestFloorPrices: ', latestFloorPrices, '\n\n');

            console.log('Intial seeding done!\n\n--------------------------------------------------------------------------------------------------------------------------------\n\n\n\n\n\n')

            //update latest floors for every user alert entry
            await this.floorDbActions.updateLatestFloors(
                alertCollections,
                latestFloorPrices,
            );



        } catch (error) {
            this.logger.error(
                `Failed to fetch latest transactions: ${error.message}`,
            );
            throw error;
        }
    }

    @Cron('*/2 * * * *')
    async handleCron() {
        this.logger.log('------------------------------------------------------------------------------------------------------------------------------------\n\n\nCRON Alerts');

        //get all the user - collection entries that require alerting
        const alertCollections: {
            aId: string;
            userId: string;
            collectionId: string;
            latestFloor: number;
        }[] = await this.floorDbActions.getAllFloorCollectionAlerts();

        console.log('alertCollections: ', alertCollections, '\n\n');

        //extract collection ids
        const uniqueCollectionIds: string[] = Array.from(
            new Set(alertCollections.map((collection) => collection.collectionId)),
        );

        console.log('uniqueCollectionIds: ', uniqueCollectionIds, '\n\n');

        //call simple hash API to fetch latest collection floor details
        const latestFloorPrices: Record<string, number> = await this.fetchService.fetchCollectionsLatestFloorPrice(
            uniqueCollectionIds,
        );

        console.log('latestFloorPrices: ', latestFloorPrices, '\n\n');

        //get previous floor prices
        const previousFloorPrices: Record<string, number> = alertCollections.reduce(
            (acc, alert) => ({
                ...acc,
                [alert.collectionId]: alert.latestFloor,
            }),
            {},
        );

        console.log('previousFloorPrices: ', previousFloorPrices, '\n\n');

        //find collections with delta in floors
        const deltaCollections: DeltaCollection[] = await this.deltaService.calcDelta(
            uniqueCollectionIds,
            previousFloorPrices,
            latestFloorPrices,
        );

        console.log('deltaCollections: ', deltaCollections, '\n\n');

        //find users who need to be alerted
        const usersToAlert = deltaCollections.reduce((acc, deltaCollection) => {
            const users = alertCollections
                .filter(alert => alert.collectionId === deltaCollection.collectionId)
                .map(alert => alert.userId);

            return {
                ...acc,
                [deltaCollection.collectionId]: {
                    deltaValue: deltaCollection.delta,
                    users,
                },
            };
        }, {});

        //alert users
        // for (const [collectionId, { deltaValue, users }] of Object.entries<{ deltaValue: number, users: string[] }>(usersToAlert)) {
        //     console.log(`Alerting users for collection ${collectionId} with delta ${deltaValue}%`);
        //     console.log(`Users to alert: ${users.join(', ')}`);
        // }
        console.log('usersToAlert: ', usersToAlert, '------------------------------------------------------------------------------------------------------------------------------------------------\n\n');

        //send alerts on telgram
        await this.telegramService.sendAlerts(usersToAlert);
    }
}
