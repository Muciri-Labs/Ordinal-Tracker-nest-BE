import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class FetchService {
    async fetchCollectionsLatestFloorPrice(collectionIds: string[]) {
        const currentTime = Math.floor(Date.now() / 1000);
        const oneHourBefore = currentTime - 3600;

        const fetchPromises = collectionIds.map(async (collectionId) => {
            const hourlyApiUrl = `https://api.simplehash.com/api/v0/nfts/floor_prices_v2/collection/${collectionId}/hourly?marketplace_ids=magiceden&from_timestamp=${oneHourBefore}&to_timestamp=${currentTime}`;

            try {
                const hourlyResponse = await axios.get(hourlyApiUrl, {
                    headers: { 'x-api-key': process.env.SIMPLE_HASH ?? '' },
                });

                const currentFloorPrice = hourlyResponse.data.floor_prices[0]?.floor_price ?? null;

                return {
                    [collectionId]: currentFloorPrice,
                };
            } catch (error) {
                console.error(
                    `Error fetching data for collection ID ${collectionId}:`,
                    error
                );
                return null;
            }
        });

        try {
            const floorPrices = await Promise.all(fetchPromises);
            if (floorPrices.length === 0) {
                throw new Error("No floor prices found");
            }

            // Merge all objects into one
            const result = Object.assign({}, ...floorPrices);

            return result;
        } catch (error) {
            console.error("Error fetching floor prices:", error);
            return {};
        }
    }
}