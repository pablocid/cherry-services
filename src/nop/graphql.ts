// import { graphqlLambda, graphiqlLambda } from 'apollo-server-lambda';

// // tslint:disable-next-line:no-var-requires
// const {graphqlLambda} = require('apollo-server-lambda');

// import { makeExecutableSchema } from 'graphql-tools';

// import { typeDefs } from '@/libs/graphql/schema';
// import { resolvers } from '@/libs/graphql/resolvers';

// const myGraphQLSchema = makeExecutableSchema({
//     typeDefs,
//     resolvers
// });

// export default async (event: any, context: any) => {
//     return graphqlLambda({ schema: myGraphQLSchema });
// };

import { graphql, GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLNonNull } from 'graphql';

// This method just inserts the user's first name into the greeting message.
// const getGreeting = firstName => `Hello, ${firstName}.`;

// Here we declare the schema and resolvers for the query
const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'RootQueryType', // an arbitrary name
        fields: {
            // the query has a field called 'greeting'
            greeting: {
                // we need to know the user's name to greet them
                args: { firstName: { name: 'firstName', type: new GraphQLNonNull(GraphQLString) } },
                // the greeting message is a string
                type: GraphQLString,
                // resolve to a greeting message
                resolve: (parent, args) => 'getGreeting(args.firstName)'
            }
        }
    }),
});

// We want to make a GET request with ?query=<graphql query>
// The event properties are specific to AWS. Other providers will differ.

export default async (event: any, context: any) => {
    return await graphql(schema, 'query={greeting(firstName: "Jeremy")}');
};
