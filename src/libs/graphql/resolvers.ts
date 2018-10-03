import { Types } from 'mongoose';
import { find } from 'lodash';
import { Records } from '@/libs/graphql/mongomode';

function checkParam(param: any, dataType: string) {

    if (param === null) { return false; }
    let response = false;

    if (dataType === 'string') {
        if (typeof param === 'string' && param.length > 0) {
            response = true;
        }
    }

    if (dataType === 'number') {
        // console.log('chequea numero')
        if (typeof param === 'number') {
            response = true;
        }
        if (typeof param === 'string') {

            if (/^\d*$/.test(param)) {
                // console.log('es  numero')
                response = true;
            }
        }
    }

    if (dataType === 'objectId') {
        if (/^[0-9a-f]{24}$/i.test(param)) {
            response = true;
        }
    }

    // filtro de registros
    if (dataType === 'filter') {
        // checkeando si hay errores en el parseo a JSON
        try {
            const arr = JSON.parse(param);
            // check if is an Array and if is empty
            if (arr.length) {
                // verificando si los obj dentro del array tiene las propiedades key, datatype y value
                let isValid = true;
                // tslint:disable-next-line:prefer-for-of
                for (let index = 0; index < arr.length; index++) {
                    if (arr[index].key === null || arr[index].value === null || arr[index].datatype === null) {
                        isValid = false;
                    }
                }
                response = isValid;
            }

        } catch (err) {
            response = false;
            console.log('invalid JSON');
        }
    }

    return response;
}

interface IFilterObj {
    key: string;
    value: any;
    datatype: string;
}
interface IQueryObj {
    schm: string;
    filter: IFilterObj[];
}

interface IRecord {
    _id: string;
    schm: string;
    created: string;
    updated: Array<{ user: string, date: string }>;
    attributes: IAttribute[];
}

interface IAttribute {
    id: string;
    string: string;
    number: number;
    boolean: boolean;
    list: string[];
    reference: string;
    listOfObj: Array<{ id: string, string: string }>;
}

export const resolvers = {
    // JSON: GraphQLJSON,
    Query: {
        getRecord: async (root: any, o: { id: string }) => await Records.findById(o.id),

        // getRecords: async (root: any, o: { schm: string, filter: Array<{ key: string, value: any, datatype: string }> }) => {
        //     const query: any = {};
        //     // filtrar por schm
        //     if (checkParam(o.schm, 'objectId')) { query.schm = o.schm; }

        //     if (checkParam(o.filter, 'filter')) {
        //         query['$and'] = [];

        //         const filter: any = JSON.parse(o.filter);
        //         // tslint:disable-next-line:prefer-for-of
        //         for (let i = 0; i < filter.length; i++) {
        //             const p: any = { attributes: {} };
        //             p["attributes"]["$elemMatch"] = {};
        //             p["attributes"]["$elemMatch"]['id'] = filter[i].key;
        //             p["attributes"]["$elemMatch"][filter[i].datatype] = filter[i].value;
        //             query["$and"].push(p);
        //         }
        //         // console.log("filter", filter);
        //     }
        //     // console.log(query)
        //     return await Records.find(query);
        // },
        // getUnit: async (root: any, o: { id: string }) => await Records.findById(o.id),
        getUnit: async (root: any, o: { id: string }) => {
            const record: any = await Records.findById(o.id);
            if (record) {
                record.obj = record;
            }

            return record; // {...record };
        },

    },
    Unit: {
        assessments: async (obj: any, rec: { ids: string[] }, context: any, info: any) => {
            const pipe = [];
            pipe.push({ $match: { attributes: { $elemMatch: { id: '57c42f77c8307cd5b82f4486', reference: obj._id } } } });

            if (Array.isArray(rec.ids) && rec.ids.length > 0) {
                const match: any = { $match: { $or: [] } };
                for (const schm of rec.ids) {
                    match.$match.$or.push({ schm: Types.ObjectId(schm) });
                }
                pipe.push(match);
            }
            return await Records.aggregate(pipe);
        },
        parents: async (obj: IRecord, rec: { ids: string[] }, context: any, info: any) => {
            const query: any = { $or: [] };

            for (const id of rec.ids) {
                const ref = find(obj.attributes, { id });
                if (!rec || !ref || !ref.reference) { continue; }
                query.$or.push({ _id: ref.reference });
            }
            console.log(query);
            return await Records.find(query);
        },
        children: async (obj: any, rec: { id: string, query: IQueryObj }, context: any, info: any) => {

            const q: any = {
                attributes: {
                    $elemMatch: {
                        id: rec.id || 'no id',
                        reference: obj._id
                    }
                }
            };

            if (rec.query) {

                if (rec.query.schm) {
                    q.schm = rec.query.schm;
                }

                if (rec.query.filter) {
                    q.$and = [];

                    const filter = rec.query.filter;
                    // tslint:disable-next-line:prefer-for-of
                    for (let i = 0; i < filter.length; i++) {
                        const p: any = { attributes: {} };
                        p.attributes.$elemMatch = {};
                        p.attributes.$elemMatch.id = filter[i].key;
                        p.attributes.$elemMatch[filter[i].datatype] = filter[i].value;
                        q.$and.push(p);
                    }
                }
            }
            return await Records.find(q);
        },
        attributes: (obj: any, rec: { ids: string[] }, context: any, info: any) => {
            if (!rec.ids || !Array.isArray(rec.ids) || !rec.ids.length) { return obj.attributes; }
            const attrs = [];
            for (const id of rec.ids) {
                attrs.push(find(obj.attributes, { id }));
            }
            return attrs;
        },
    },
    Assessment: {

    },
    Record: {
        attributes: (obj: any, rec: { ids: string[] }, context: any, info: any) => {
            if (!rec.ids || !Array.isArray(rec.ids) || !rec.ids.length) { return obj.attributes; }
            const attrs = [];
            for (const id of rec.ids) {
                attrs.push(find(obj.attributes, { id }));
            }
            return attrs;
        },
        reference: async (obj: any, rec: { schm: string, id: string }, context: any, info: any) => {
            return await Records
                .findOne({
                    schm: rec.schm,
                    attributes: {
                        $elemMatch: {
                            id: rec.id || '57c42f77c8307cd5b82f4486',
                            reference: obj._id
                        }
                    }
                });
        },
        references: async (obj: any, rec: { schms: string[] }, context: any, info: any) => {
            const pipe = [];
            pipe.push({ $match: { attributes: { $elemMatch: { id: '57c42f77c8307cd5b82f4486', reference: obj._id } } } });

            if (Array.isArray(rec.schms) && rec.schms.length > 0) {
                const match: any = { $match: { $or: [] } };
                for (const schm of rec.schms) {
                    match.$match.$or.push({ schm: Types.ObjectId(schm) });
                }
                pipe.push(match);
            }
            return await Records.aggregate(pipe);
        },
        relation: async (obj: any, rec: { id: string, query: IQueryObj }, context: any, info: any) => {
            const q: any = {
                attributes: {
                    $elemMatch: {
                        id: rec.id || 'no id',
                        reference: obj._id
                    }
                }
            };

            if (rec.query) {

                if (rec.query.schm) {
                    q.schm = rec.query.schm;
                }

                if (rec.query.filter) {
                    q.$and = [];

                    const filter = rec.query.filter;
                    // tslint:disable-next-line:prefer-for-of
                    for (let i = 0; i < filter.length; i++) {
                        const p: any = { attributes: {} };
                        p.attributes.$elemMatch = {};
                        p.attributes.$elemMatch.id = filter[i].key;
                        p.attributes.$elemMatch[filter[i].datatype] = filter[i].value;
                        q.$and.push(p);
                    }
                }
            }

            console.log(JSON.stringify(q));

            return await Records.find(q);
        },
    },
    Attribute: {
        Reference: async (obj: any, { }, context: any, info: any) => {
            return await Records.findOne({ _id: obj.reference });
        }
    },
    // Mutation: {
    // createFriend: (root, { input }) => {
    //     const newFriend = new Friends({
    //         firstName: input.firstName,
    //         lastName: input.lastName,
    //         gender: input.gender,
    //         language: input.language,
    //         age: input.age,
    //         email: input.email,
    //         contacts: input.contacts
    //     });
    //     newFriend.id = newFriend._id;
    //     return new Promise((resolve, reject) => {
    //         newFriend.save((err) => {
    //             if (err) reject(err)
    //             else resolve(newFriend)
    //         })
    //     })
    // },
    // updateFriend: (root, { input }) => {
    //     return new Promise((resolve, reject) => {
    //         Friends.findOneAndUpdate({ _id: input.id }, input, { new: true }, (err, friend) => {
    //             if (err) reject(err)
    //             else resolve(friend)
    //         })
    //     })
    // },
    // deleteFriend: (root, { id }) => {
    //     return new Promise((resolve, reject) => {
    //         Friends.remove({ _id: id }, (err) => {
    //             if (err) reject(err)
    //             else resolve('Successfully deleted friend')
    //         })
    //     })
    // }
    // }
};
