export type JSONValue =
    | string
    | number
    | boolean
    | { [x: string]: JSONValue }
    | Array<JSONValue>;

    interface JSONObject {
        [x: string]: JSONValue;
    }
    
    interface JSONArray extends Array<JSONValue> { }