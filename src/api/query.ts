
// Dependencies
import { ObjectId, MongoClient } from 'mongodb';

// Local
import config from '@/util/config';

// Load config as constants
const uri = config.db.uri;
const cuartel = new ObjectId(config.db.cuartel);
const hilera = new ObjectId(config.db.hilera);
const plantSchema = new ObjectId(config.db.plantaSchema);

// Local functions
const getParameter = (event: any, key: string): string => {
	if (!event.queryStringParameters)
		throw new Error('Missing queryStringParameters');
	if (!event.queryStringParameters[key])
		throw new Error(`Missing query parameter: '${key}'`);

	return event.queryStringParameters[key];
};

export default async (event: any, context: any) => {
	// Init data from parameters
	const fenSchm = new ObjectId(getParameter(event, 'schm'));
	const c = parseInt(getParameter(event, 'c'), 0);
	const h = parseInt(getParameter(event, 'h'), 0);
	const database = getParameter(event, 'db');

	// Connect and query
	const client = await MongoClient.connect(uri);
	const collection = client.db(database).collection('records');
	const result = await collection.aggregate([
		{
			$match:
			{
				schm: plantSchema,
				$and: [
					{ attributes: { $elemMatch: { id: cuartel, number: c } } },
					{ attributes: { $elemMatch: { id: hilera, number: h } } },
				]
			}
		},
		{
			$lookup:
			{
				from: 'records',
				let: { id: '$_id' },
				pipeline:
					[
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ['$schm', fenSchm] },
										{ $eq: ['$reference', '$$id'] }
									]
								}
							}
						}
					],
				as: 'reference'
			}
		},
		{
			$project:
			{
				schm: 1,
				code: 1,
				type: 1,
				created: 1,
				updated: 1,
				attributes: 1,
				reference: { $arrayElemAt: ['$reference', 0] }
			}
		},
		{
			$limit: 1
		}
	]).toArray();
	client.close();

	if (!result || !Array.isArray(result))
		throw new Error('Something is wrong with the db');

	return result;
};
