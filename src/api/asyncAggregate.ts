import { Lambda } from 'aws-sdk';
export default async (event: any, context: any) => {

    const lambda = new Lambda({
        region: 'us-east-1' // change to your region
    });

    // lambda.invoke({
    //     FunctionName: 'cherrytracker-services-prod-aggregate',
    //     Payload: JSON.stringify(event, null, 2) // pass params
    // });

    lambda.invoke({
        FunctionName: 'cherrytracker-services-prod-aggregate',
        Payload: JSON.stringify(event, null, 2) // pass params
    },  (error, data) => {
        if (error) {
            console.log('erro', error);
        }
        if (data) {
            console.log(data);
        }
    });
    return 'RUNNING';
};
