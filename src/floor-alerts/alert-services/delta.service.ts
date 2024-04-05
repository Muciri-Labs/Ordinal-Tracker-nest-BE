import { Injectable } from '@nestjs/common';

@Injectable()
export class DeltaService {

    async calcDelta(
        uniqueCollectionIds: string[],
        previousFloorPrices: Record<string, number>,
        latestFloorPrices: Record<string, number>,
    ) {
        // Define a type for deltaCollections
        type DeltaCollection = {
            collectionId: string;
            delta: number;
        };

        //for every unique collection id find the delta using the previous and latest floor prices by mapping the keys i.e. collection ids
        const deltaCollections: DeltaCollection[] = uniqueCollectionIds.map((collectionId) => {
            const previousFloor = previousFloorPrices[collectionId];
            const latestFloor = latestFloorPrices[collectionId];
            //delta will be a percentage increase or decrease with negative sign for decrease
            const delta = ((latestFloor - previousFloor) / previousFloor) * 100;
            if (delta !== 0 && delta !== Infinity && delta !== -Infinity && !isNaN(delta) && (delta >= 2 || delta <= -2)) {
                return {
                    collectionId,
                    delta
                }
            } else {
                return null;
            }
        });

        //filter for null
        return deltaCollections.filter((delta) => delta !== null);
    }
}
