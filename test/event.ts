// declare const app: any;
//
// interface Event {
//   body: Record<any, any>;
//   params: Record<any, any>;
//   headers: Record<any, any>;
//   reply: {
//     ok: (body?: any) => CompletedEvent;
//     internalServerError: (body?: any) => CompletedEvent;
//     unauthorized: (body?: any) => CompletedEvent;
//   };
//   next: () => void;
// }
//
// interface CompletedEvent extends Event {
//   isCompleted: true;
// }
//
// interface ValidatedEvent extends Event {
//   isValidated: true;
// }
//
// interface AuthenticatedEvent extends Event {
//   isAuthenticated: true;
// }
//
// //
// //
// //
//
// const one = (event: Event): ValidatedEvent | CompletedEvent => {
//   event.next();
//   return { ...event, isValidated: true };
// };
//
// const two = (event: Event): AuthenticatedEvent | CompletedEvent => {
//   return event.reply.internalServerError();
//   // return { ...event, isAuthenticated: true };
// };
//
// type Comet = <T extends readonly unknown[]>(
//   options: {
//     method: string;
//     path: string;
//     // middlewares: Array<(event: Event) => Event>;
//     middlewares: T;
//   },
//   // handler: (event: typeof options.middlewares extends (infer R)[] ? R : number) => unknown
//   handler: (event: T extends ((event: Event) => (infer R))[] ? R : never) => unknown
// ) => void;
//
// declare const useComet: Comet;
//
// useComet({
//   method: 'get',
//   path: '/api/users/:userId',
//   middlewares: [one, two],
// }, event => {
//   console.log(event);
//   event.
// });
//
// // TODO
// // drop regex and split
// // declarative, useComet
