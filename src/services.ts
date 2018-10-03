
// Local
import runner from './util/runner';

// Functions
// import echo from './api/echo';
import query from './api/query';
import aggregate from './api/aggregate';
// import mongo_to_gs from './api/mongo_to_gs';
// import graphql from './api/graphql';
import asyncAggregate from './api/asyncAggregate';
import aggregateQuery from './api/aggregation_query';
import toSheet from './api/to_sheet';
import fromSheet from './api/from_sheet';

module.exports = {
	// echo: runner(echo),
	query: runner(query),
	// mongo_to_gs: runner(mongo_to_gs),
	// graphql: runner(graphql),
	aggregate: runner(aggregate),
	asyncAggregate: runner(asyncAggregate),
	aggregateQuery: runner(aggregateQuery),
	toSheet: runner(toSheet),
	fromSheet: runner(fromSheet)
};
