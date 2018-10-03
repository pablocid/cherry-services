
export const typeDefs = `
scalar JSON
type Unit {
    _id:ID
    schm: ID
    created:String
    updated:[Updated]
    attributes(ids:[String]):[Attribute]
    parents(ids:[String]!):[Unit]
    children(id:String!, query:QueryObject):[Unit]
    assessments(ids:[String]):[Assessment]
}

type Assessment {
    _id:ID
    schm: ID
    created:String
    updated:[Updated]
    attributes(ids:[String]):[Attribute]
}

type Record {
    _id:ID
    schm: ID
    created:String
    updated:[Updated]
    attributes(ids:[String]):[Attribute]
    reference(schm:String!, id:String):Record
    references(schms:[String]):[Record]
    relation(id:String!, query:QueryObject):[Record]
}

type Updated {
    user:String
    date:String
}

type Attribute {
    id:String
    string:String
    reference:ID
    Reference:Record
    number:Float
    list:[String]
    boolean:Boolean
    value:JSON
}

type Query {
    getRecord(id:ID!):Record
    getRecords(schm:String!, filter:String):[Record]
    getUnit(id:ID!):Unit
}

input QueryObject {
    schm:ID,
    filter:[FilterObject]
}

input FilterObject {
    key:String
    value:String
    datatype:AttrDataTypes
}

enum AttrDataTypes {
    string
    number
    list
    listOfObj
    boolean
    reference
}

`;
