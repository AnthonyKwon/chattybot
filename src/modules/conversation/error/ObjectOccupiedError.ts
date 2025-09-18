/**
 * ConversationExistsError is thrown when Bot already has existing conversation and in use for current guild.<br/>
 * Thrown name is determined by type of occupied object.
 */
export class ObjectOccupiedError extends Error {
   constructor(message: string, type: OccupiedObject = OccupiedObject.None) {
       super(message);

       // determine error name by object type
       switch (type) {
           case OccupiedObject.Thread:
               this.name = "ThreadOccupiedError";
               break;
           case OccupiedObject.Voice:
               this.name = "VoiceOccupiedError";
               break;
           default:
               this.name = "ObjectOccupiedError";
               break;
       }
   }
}

export enum OccupiedObject {
    Thread,
    Voice,
    None
}